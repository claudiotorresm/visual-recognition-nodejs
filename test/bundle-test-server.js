'use strict';

var http = require('http');
var express = require('express');
var permutations = require('./bundle-results-check').permutations;
var processResults = require('./process bundle results')
var app = express();

app.get('/', function(req, res) {
  res.send('<p>Current test results: <a href="/results">summary</a> or <a href="/json">raw JSON</a></p>')
});

app.get('/json', function(req, res) {
  res.json(permutations);
});

app.get('/results', function(req, res) {
  res.type('.txt').send(processResults(permutations));
});

app.get('/stored/results', function(req, res) {
  var perms = require('./bundle-results.json');
  res.type('.txt').send(processResults(perms));
});


var port = process.env.VCAP_APP_PORT || 3000;
http.createServer(app).listen(port);

console.log('server listening on http://localhost:%s/', port);
