'use strict';

var path = require('path');
var fs = require('fs');

var through = require('through2');
var defs = require('defs');

module.exports = function defsify(filepath) {
  var ext = path.extname(filepath);

  if (ext !== '.js') {
    return through();
  }

  var contents = '';
  var stream = through(transform, flush);

  return stream;

  function transform(chunk, enc, callback) {
    contents += chunk;
    callback();
  }

  function flush(callback) {
    readDefsConfig(function (oO, config) {
      if (oO) {
        callback(oO);
      } else {
        try {
          var result = defs(contents, config);
        } catch (oO) {
          callback(oO); return;
        }

        if (result.errors && result.errors.length) {
          callback(new Error(result.errors.join('\n')));
        } else {
          stream.push(result.src);
          callback();
        }
      }
    });
  }
}

function readDefsConfig(callback) {
  fs.readFile('defs-config.json', 'utf8', function (oO, contents) {
    if (oO) {
      if (oO.code === 'ENOENT') {
        contents = '{}';
      } else {
        callback(oO); return;
      }
    }

    try {
      var config = JSON.parse(contents);
    } catch (oO) {
      callback(oO); return;
    }

    callback(null, config);
  });
}
