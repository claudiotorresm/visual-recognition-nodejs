// https://github.com/watson-developer-cloud/node-sdk/issues/264
var path = require('path');
var fs = require('fs');
var watson = require('watson-developer-cloud');

var visualRecognition = watson.visual_recognition({
  api_key: 'bogus',
  version: 'v3',
  version_date: '2016-05-20'
});

visualRecognition.classify({
  images_file: fs.createReadStream(path.join(__dirname, '../../', 'public/images/bundles/dogs/test/1.jpg'))
}, function(err, res) {
  // expected: err should contain the error message, res should be null
  // actual: err is null and res contains the error message
  console.log(err, res);
});
