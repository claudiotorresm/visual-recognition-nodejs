'use strict';
// this file is to validate that the test images we supply get proper results with the various class bundles
// it simply creates every permutation of classifiers (only 20 per category since we require a minimum of 3 selected) and then checks every image to ensure it's getting the expected classification

/* eslint no-console: 0, no-shadow: 0, no-param-reassign: 0, padded-blocks: 0 */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

// we could embed the expected category into the filename, but then someone might think the service was cheating. so, this will do for now.
var testImages = {
    // this maps to public/images/bundles/dogs/test/{index}.jpg
  dogs: [
    'husky',
    false,
    'dalmation',
    false,
    'beagle',
    'goldenretriever',
    'husky' // same as 0 except with wrong proportions
  ],
  fruits: [
    'peach',
    false,
    false,
    'apple',
    'grapes',
    'banana',
    'pear',
    'orange'
  ],
  insurance: [
    'motorcycleaccident',
    false,
    'vandalism',
    false,
    'motorcycleaccident',
    'flattire', // 5.jpg
    null, // no 6.jpg
    'vandalism',
    null, // no 8.jpg
    'brokenwindshield'
  ],
  moleskine: [
        // notes:
        //
        // notebook vs journal: I think a notebook has a hard cover, an elastic band, and a ribbon to keep your place,
        // whereas a journal has a paper cover and no ribbon or elastic
        //
        // I'm not entirely sure if 'portrait' vs 'landscape' was intended to classify the orientation or the contents...
        // I would guess the former except that all the sample images all showing drawings of landscapes and people (?)
        //
        // Either way, I think each image should probably have two classifications.. but the training data isn't
        // sufficient to do that reliably

    'journaling', // watson incorrectly classifies this one - sometimes it's both jouraling and notebook, other times it's neither
    false,
    'landscape',
    'landscape',
    false,
    'landscape',
    false,
    'journaling',
    'journaling', // ?
    'journaling',
    'landscape', // 10.jpg
    false,
    'portrait',
    false,
    'portrait',
    'portrait', // 15.jpg
    null,
    false,
    'landscape'
  ],
  omniearth: [
    'baseball',
    'baseball',
    'cars',
    false, // I think this might actually be a car, but I'm honestly not sure
    'tennis',
    'golf', // 5.jpg
    'cars',
    'cars',
    'golf',
    'golf',
    'golf', // 10.jpg
    null,
    'golf',
    'golf',
    'tennis',
    null, // 15
    'tennis',
    'cars',
    null,
    null,
    'cars' // 20.jpg
  ]
};



// rewrite test images to include details
testImages = _.mapValues(testImages, function(list, category) {
  return list.map(function(tag, index) {
    if (tag === null) {
      return tag;
    }
    return {
      'class': tag,
      file: path.join(category, 'test', index + '.jpg'),
      live: category !== 'fruits' && index < 6
    };
  }).filter(function(test) {
    return test; // filter out the nulls (we need them up until now to keep the indexes lined up with the filenames)
  });
});

function createTests(classifiers) {
  classifiers = classifiers.map(function(c) {
    return {
      classifier_id: c.classifier_id,
      category: c.name.split('_')[0],
      classes: _.map(c.classes, 'class') // converts it from [{class:'foo'},...] to just ['foo',...]
    };
  });

  var tests = _.flatten(classifiers.map(function(c) {
    return _.filter(testImages[c.category].map(function(image) {
      return {
        classifier_id: c.classifier_id,
        class: image.class,
        // false expected means no class should be detected
        expected: (image.class && c.classes.indexOf(image.class) > -1) ? image.class : false,
        file: image.file,
        live: image.live
      };
    }));
  }));

  return tests;
}


module.exports = createTests;


if (!module.parent) {
  var classifiers = require('./classifiers.json');

  var tests = createTests(classifiers);

  fs.writeFileSync(path.join(__dirname, 'tests.json'), JSON.stringify(tests, null, 2));

  console.log('%s tests written to tests.json', tests.length);
}
