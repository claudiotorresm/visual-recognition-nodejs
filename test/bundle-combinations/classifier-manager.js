'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');
var getCombinations = require('combinations');
require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud');

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v3',
  api_key: process.env.API_KEY || '<api-key>',
  version_date: '2015-05-19'
});

var cacheFile = path.join(__dirname, 'classifiers.json'); // where to cache results
var POLLING_DELAY = 2000; // ms: 2000 == 2 seconds - delay between checks when waiting on classifier to finish training
var basedir = path.join(__dirname, '../public/images/bundles'); // where are the folders with .zip files
var MIN_TAGS = 3; // minimum number of classifications

// pols the service to determine when a given classifier is done training
function classifierDone(id, next) {
  visualRecognition.getClassifier({classifier_id: id}, function(err, res) {
    if (err) {
      return next(err);
    }

    if (res.status === 'ready') {
      return next(null, res);
    } else if (res.status === 'failed') {
      return next(res, res);
    } else {
      setTimeout(classifierDone.bind(null, id, next), POLLING_DELAY);
    }
  });
}

function getAllPermutations() {
  return fs.readdirSync(basedir).filter(function(filename) {
    return fs.statSync(path.join(basedir, filename)).isDirectory();
  }).map(function(catName) {
    return {
      category: catName,
      classes: fs.readdirSync(path.join(basedir, catName)).filter(function(filename) {
        return path.extname(filename) === '.zip';
      }).map(function(filename) {
        return path.basename(filename, '.zip');
      })
    };
  }).reduce(function(perms, cat) {
    var newPerms = getCombinations(cat.classes, MIN_TAGS).map(function(classes) {
      return {
        category: cat.category,
        classes: classes
      };
    });
    return perms.concat(newPerms);
  }, []);
}

// creates all possible classifiers from the .zip files in hte basedir
function createClassifiers(cb) {
  var permutations = getAllPermutations();
  // set up a queue to handle each permutation with CONCURRENCY parallel workers
  // return the details once it's finished training
  var CONCURRENCY = 10;
  async.mapLimit(permutations, CONCURRENCY, function(perm, done) {
    // create the classifier
    var classifierOptions = {
      name: [perm.category].concat(perm.classes).join('_')
    };
    perm.classes.forEach(function(tag) {
      var key =  (tag.match(/negative|non-fruit/)) ? 'negative_examples' : tag + '_positive_examples';
      classifierOptions[key] = fs.createReadStream(path.join(basedir, perm.category, tag + '.zip'));
    });
    visualRecognition.createClassifier(classifierOptions, function(err, classifier) {
      if (err) {
        return done(err);
      }
      perm.classifier = classifier;

      // wait until it's finished processing
      // add a delay because it will sometimes 404 if called immediately after creating the classifier :(
      setTimeout(classifierDone.bind(null, classifier.classifier_id, done), 5 * 1000);
    });
  }, cb);
}


function getClassifiers(cb) {
  fs.stat(cacheFile, function(err /* , stats*/) {
    if (err) {
      if (err.code !== 'ENOENT') {
        return cb(err);
      } else {
        return createClassifiers(cb);
      }
    }
    return require(cacheFile);
  });
}


exports.getAllPermutations = getAllPermutations;
exports.createClassifiers = createClassifiers;
exports.getClassifiers = getClassifiers;

// https://nodejs.org/docs/latest/api/modules.html#modules_module_parent
if (!module.parent) {
  console.log('creating classifiers');
  createClassifiers(function(err, classifiers) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    fs.writeFileSync(cacheFile, JSON.stringify(classifiers, null, 2));
    console.log('%s classifiers created, details written to %s', classifiers.length, cacheFile);
  });
}
