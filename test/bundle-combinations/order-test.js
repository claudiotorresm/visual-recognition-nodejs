'use strict';

// var createClassifiers = require('./classifier-manager').createClassifiers;
var testRunner = require('./run-tests');

function run() {
// var permutations =  [{
//     // this is the order when reading the .zips from disk
//   category: 'dogs',
//   classes: ['dalmation', 'goldenretriever', 'husky']
// }, {
//     // this is the order they appear in on the website
//   category: 'dogs',
//   classes: ['goldenretriever', 'husky', 'dalmation']
// }];
//


// console.log('creating two classifiers with the same classes, but in different orders');
// createClassifiers(permutations, function(err, classifiers) {
//   if (err) {
//     console.error(err);
//     process.exit(1);
//   }
//   console.log('classifiers created and ready', classifiers);
  console.log('running test image against classifiers');
  var tests = [
    {
      'classifier_id': 'dogs_dalmation_goldenretriever_husky_1079664685',
      'class': 'dalmation',
      'expected': 'dalmation',
      'file': 'dogs/test/2.jpg',
      'live': false
    },  {
      'classifier_id': 'dogs_goldenretriever_husky_dalmation_1428510906',
      'class': 'dalmation',
      'expected': 'dalmation',
      'file': 'dogs/test/2.jpg',
      'live': true
    },  {
      'classifier_id': 'dogs_dalmation_goldenretriever_husky_1182792512', // this is from when I did the complete list of permutations yesterday
      'class': 'dalmation',
      'expected': 'dalmation',
      'file': 'dogs/test/2.jpg',
      'live': false
    }
  ];
  testRunner.run(tests, function(err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('testing complete, results:', results);
    console.log(testRunner.results(results));
  });
// });
}

module.exports = run;

if (!module.parent) {
  run();
}


