'use strict';

var createClassifiers = require('./classifier-manager').createClassifiers;
var testRunner = require('./run-tests');

function setup(cb) {
  var permutations =  [{
    // this is the order when reading the .zips from disk
    category: 'dogs',
    classes: ['dalmation', 'goldenretriever', 'husky']
  }, {
    // this is the order they appear in on the website
    category: 'dogs',
    classes: ['goldenretriever', 'husky', 'dalmation']
  }];

  console.log('creating two classifiers with the same classes, but in different orders');
  createClassifiers(permutations, function(err, classifiers) {
    if (err) {
      cb(err);
    }
    console.log('classifiers created and ready', classifiers);
    cb(null, classifiers);
  });
}

function run(classifiers) {
  console.log('running test image against classifiers');
  var tests = classifiers.map(function(c) {
    return {
      'classifier_id': c.classifier_id,
      'class': 'dalmation',
      'expected': 'dalmation',
      'file': 'dogs/test/2.jpg'
    }
  });
  testRunner.run(tests, function(err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('testing complete, results:');
    // console.log(JSON.stringify(results, null, 2));
  });
}

exports.run = run;
exports.runFull = function() {
  setup(function(err, classifiers) {
    if (err) {
      return console.log(err);
    }
    run(classifiers);
  });
};
exports.runPre = function() {
  var classifiers = [
    {
      'classifier_id': 'dogs_dalmation_goldenretriever_husky_1079664685' // this and the next one were created by my first run of this script. both worked initially
    },
    {
      'classifier_id': 'dogs_goldenretriever_husky_dalmation_1428510906'
    },
    {
      'classifier_id': 'dogs_dalmation_goldenretriever_husky_1182792512' // this is from when I did the complete list of permutations yesterday
    }
  ];
  run(classifiers);
};

if (!module.parent) {
  exports.runFull();
}


