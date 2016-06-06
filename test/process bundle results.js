// this file assumes the output from running all bundle permutations is saved in bundle-results.json
// it was written in the REPL, please excuse the sloppiness

var results = require('./test/bundle-results.json');
var l = require('lodash');
results.forEach(function(r) { r.tests.forEach(function(t){ t.category = r.category; t.classes = r.classes;}) });
var testSets = results.map(function(r) { return r.tests; });
tests = l.flatten(testSets);
tests = l.filter(tests, 'complete');
tests = l.filter(tests, function(t) { return t.category != 'fruits' });

tests.forEach(function(t) { if(t.success) { delete t.results; } } ) ;

tests.forEach(function(t) { t.filename = t.category + '/tests/' + path.basename(t.filename) } );

failures = l.filter(tests, function(t) { return !t.success });
failuresByFile = l.groupBy(failures, 'filename');

var sorted2dfailures = l.sortBy(l.values(failuresByFile), function(group) { return group[0].filename; });

sorted2dfailures.forEach(function(list) { console.log('%s (%s)',list[0].filename,list[0].class); list.forEach(function(f) { console.log(' - %s when selected bundles were %s', f.actual.length? 'misclassified as ' + l.map(f.actual, 'class').join(', ') : 'unrecognized', f.classes.join(', ')); }) }), void(0);
