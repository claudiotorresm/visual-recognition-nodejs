// var fs = require('fs');
// var path = require('path');
var async = require('async');
require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud');

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v3',
  api_key: process.env.API_KEY || '<api-key>',
  version_date: '2015-05-19'
});

var ids = require('./classifiers2.json');

async.eachLimit(ids, 10, function(classifier, next) {
  console.log('deleting', classifier);
  visualRecognition.deleteClassifier(classifier, next);
}, console.log);
