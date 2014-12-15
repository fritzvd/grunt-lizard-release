var fs = require('fs');
var Promise = require('promise');


var read = Promise.denodeify(fs.readFile);
var write = Promise.denodeify(fs.writeFile);

var semver = require('semver');

var findLine = function (data) {
  if (data) {
    var linebyline = data.split('\n');
    var preciseString = find(linebyline, 'Unreleased')[0];
    var lineNr = linebyline.indexOf(preciseString); 
    return {
      lineNr: lineNr, 
      data: linebyline
    };
  };
};

var match = function (searchString) {
  return function (toBeSearched) {
    return toBeSearched.match(searchString);
  };
};


var find = function (data, string) {
  return data.filter(match(string));
};

var getDate = function () {
  var date = new Date();
  var dateString = [ date.getYear() + 1900,
    date.getMonth() + 1,
    date.getDate()
  ]
  return dateString.join('-');
};

var createReleaseLine = function (release) {
  var releaseString = [
    'Release ',
    release,
    ' (',
    getDate(),
    ')']
  return releaseString.join('');
}

var insertLines = function (options) {
  var data = options.data,
      lineNr = options.lineNr,
      release = options.release;

  data.splice(lineNr + 2, 0, createReleaseLine(release), '---------------------');
  data.splice(lineNr + 2, 0, '-', '\n');

  return data;
};

var writeLines = function (fileName, lines) {
  var data = lines.join('\n');
  write(fileName, data, 'utf8');
  return 'succes'
};


/**
 *
 * Updates changelog automatically.
 * updateChangelog([fileName], release, [outFile]], callback)
 *
 */
var updateChangelog = function () {
  console.log('Updating Changelog');

  var args = Array.prototype.slice.call(arguments);
  var cb = args.slice(args.length -1);
      fileName = (args[0] !== cb) ? args[0] :'CHANGES.rst',
      release = (semver.valid(args[1])) ? args[1] : null,
      outFile = (args[2] !== cb) ? args[2] :'CHANGES.rst';
  
  if (!release) { cb(null) }

  read(fileName, 'utf8')
    .then(findLine)
    .then(function (options) {
      options.release = release;
      return insertLines(options);
      })
    .then(function (data) {
      writeLines(outFile, data)
       .then(cb);
    });
};


module.exports = {
  updateChangelog: updateChangelog
};
