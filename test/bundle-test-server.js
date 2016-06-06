'use strict';

var http = require('http');
var express = require('express');
var permutations = require('./bundle-results-check').permutations;
var app = express();

app.get('/', function(req, res) {
  res.json(permutations);
});

var port = process.env.VCAP_APP_PORT || 3000;
http.createServer(app).listen(port);

console.log('server listening on http://localhost:%s/', port);
