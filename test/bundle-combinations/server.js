'use strict';

var http = require('http');
var express = require('express');
// var classifierManager = require('./classifier-manager');
// var processResults = require('./process bundle results');
var app = express();

var runner = require('./run-tests');
runner.run();

app.get('/', function(req, res) {
  res.send('<p>Current test results: <a href="/results">summary</a> or <a href="/json">raw JSON</a></p>');
});

app.get('/json', function(req, res) {
  res.json(runner.tests);
});

app.get('/results', function(req, res) {
  res.type('.txt').send(runner.results());
});

app.get('/stored/results', function(req, res) {
  var tests = require('./test-results.json');
  res.type('.txt').send(runner.results(tests));
});


var port = process.env.VCAP_APP_PORT || 3000;
http.createServer(app).listen(port);

console.log('server listening on http://localhost:%s/', port);
