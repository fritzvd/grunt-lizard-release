var fs = require('fs');
var through = require('through2')
var rl = require('readline');

var startStream = function (file) {
  var stream = fs.createReadStream(file);
  stream.setEncoding('utf-8');

  return stream; 
};

var getHeaderLine = function (data, obj) {

  return through({objectMode: true}, function (chunk, enc, cb) {

    var lines = chunk.split('\n');
    for (var l in lines) {
      var line = lines[l].split('Unreleased');
      if (line.length > 1) {
        this.push(new Buffer(line));
        console.log(this.hasOwnProperty('emit'));
      }
    };
    cb();
  });

};



module.exports = {
  header: getHeaderLine,
  start: startStream

};
