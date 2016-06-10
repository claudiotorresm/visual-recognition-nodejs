'use strict';

var http = require('http');
var express = require('express');
var classifierManager = require('./classifier-manager');
var createTests = require('./create-tests');
var runner = require('./run-tests');
var orderTest = require('./order-test');
var app = express();

var classifiers;
var tests;

function fullSuite() {
  console.log('creating classifiers');
  classifierManager.createClassifiers(function(err, _classifiers) {
    if (err) {
      return console.log(err);
    }
    classifiers = _classifiers;
    console.log('%s classifiers created', classifiers.length);
    tests = createTests(classifiers);
    console.log('about to run %s tests', tests.length);
    runner.run(tests, function(err /* , tests*/) {
      console.log('done', err);
    });
  });
}

fullSuite();

app.get('/', function(req, res) {
  res.send('<p><a href="/classifiers">Classifiers (JSON)</a></p><p>Current test results: <a href="/results">text</a> or <a href="/tests">JSON</a></p>');
});

app.get('/order-test', function(req, res) {
  orderTest();
  res.send('started');
});

app.get('/full-order-test', function(req, res) {
  orderTest();
  res.send('started');
});

app.get('/full-suite', function(req, res) {
  fullSuite();
  res.send('started');
});

app.get('/classifiers', function(req, res) {
  res.json(classifiers);
});

app.get('/tests', function(req, res) {
  res.json(tests);
});

app.get('/results', function(req, res) {
  res.type('.txt').send(runner.results(tests));
});

app.get('/stored/results', function(req, res) {
  var tests = require('./test-results.json');
  res.type('.txt').send(runner.results(tests));
});


var port = process.env.VCAP_APP_PORT || 3000;
http.createServer(app).listen(port);

console.log('server listening on http://localhost:%s/', port);
