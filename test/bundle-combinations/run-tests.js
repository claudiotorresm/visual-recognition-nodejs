'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var util = require('util');
require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud');

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v3',
  api_key: process.env.API_KEY || '<api-key>',
  version_date: '2015-05-19'
});

var bundlesDir = path.join(__dirname, '../../public/images/bundles');

exports.tests = require('./tests.json');

// set up a queue to handle each permutation with CONCURRENCY parallel workers
var CONCURRENCY = 3;


function statusLine(test) {
  var name;
  if (test.expected) {
    name = util.format('%s should classify %s as %s', test.classifier_id, test.file, test.expected);
  } else {
    name = util.format('%s should not classify %s (%s)', test.classifier_id, test.file, test.class || 'negative');
  }

  if (test.error) {
    return util.format('x %s - Error: %s', name, JSON.stringify(test.error));
  } else if (test.success) {
    return util.format('✓ %s', name);
  } else if (test.complete) {
    return util.format('x %s, but returned %s', name, (test.actual && test.actual.length) ? JSON.stringify(test.actual) : '[no classes]');
  } else {
    return util.format('  %s', name);
  }
}

function run(tests, cb) {
  if (typeof tests === 'function') {
    cb = tests;
    tests = exports.tests;
  }
  console.log('Running %s tests at concurrency %s', tests.length, CONCURRENCY);
  async.eachLimit(tests, CONCURRENCY, function(test, next) {
    visualRecognition.classify({
      classifier_ids: [test.classifier_id],
      images_file: fs.createReadStream(path.join(bundlesDir, test.file))
    }, function(err, res) {
      if (err) {
        test.error = err;
      } else {
        test.actual = res.images[0].classifiers.length  ? res.images[0].classifiers[0].classes : [];

        if (test.expected) {
          test.success = !!test.actual.length && test.actual[0].class === test.expected;
        } else {
          test.success = test.actual.length === 0;
        }

        test.complete = true;
      }

      console.log(statusLine(test));

      next();
    });
  }, function(err) {
    cb(err, tests);
  });
}


exports.statusLine = statusLine;
exports.results = function(t) {
  return (t || exports.tests).map(statusLine).join('\n');
};
exports.run = run;


if (!module.parent) {
  console.log('running tests');
  run(function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('done');
    // fs.writeFileSync('test-results.json', JSON.stringify(classifiers, null, 2));
    // console.log('%s classifiers created, details written to %s', classifiers.length, cacheFile);
  });
}
