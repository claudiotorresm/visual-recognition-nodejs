var results = require('./test-results.json');
var runner = require('./run-tests');

var live = results.filter(function(t) {
  return t.live;
});

var failures = live.filter(function(t) {
  return !t.success;
});

console.log('%s live tests, %s live failures', live.length, failures.length);
console.log(runner.results(failures));


