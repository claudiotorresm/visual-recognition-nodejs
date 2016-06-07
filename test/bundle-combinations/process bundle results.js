// this file assumes the output from running all bundle permutations is saved in bundle-results.json
// it was mostly written in the REPL, please excuse the sloppiness
var util = require('util');
var path = require('path');
var l = require('lodash');

module.exports = function processResults(results) {
  var output = [];

  results.forEach(function(r) { r.tests.forEach(function(t) { t.category = r.category; t.classes = r.classes;}); });
  var testSets = results.map(function(r) { return r.tests; });
  var tests = l.flatten(testSets);
  tests = l.filter(tests, 'complete'); // filters out tests that failed due to e.g. network failure
  tests = l.filter(tests, function(t) { return t.category !== 'fruits'; });

  tests.forEach(function(t) { if (t.success) { delete t.results; } } );

  tests.forEach(function(t) { t.filename = t.category + '/tests/' + path.basename(t.filename); } );

  var failures = l.filter(tests, function(t) { return !t.success; });
  var failuresByFile = l.groupBy(failures, 'filename');

  var sorted2dfailures = l.sortBy(l.values(failuresByFile), function(group) { return group[0].filename; });

  sorted2dfailures.forEach(function(list) {
    output.push(util.format('%s (%s)', list[0].filename, list[0].class));
    list.forEach(function(f) {
      var status = f.actual.length ? 'misclassified as ' + l.map(f.actual, 'class').join(', ') : 'unrecognized';
      output.push(util.format(' - %s when selected bundles were %s', status, f.classes.join(', ')));
    });
  });

  return output.join('\n');
};

