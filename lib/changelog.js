var fs = require('fs');
var Q = require('q');
var semver = require('semver');


var read = Q.denodeify(fs.readFile);
var write = Q.denodeify(fs.writeFile);

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
  return 'succes';
};


/**
 *
 * Updates changelog automatically.
 * updateChangelog(release, [fileName, outFile]], callback)
 *
 */
var updateChangelog = function () {

  var deferred = Q.defer();

  var args = Array.prototype.slice.call(arguments);
  var cb = (args.length > 1) ?  args.slice(args.length -1)[0] : null,
      release = (semver.valid(args[0])) ? args[0] : null,
      fileName = (args[1] !== cb) ? args[1] || 'CHANGES.rst': 'CHANGES.rst',
      outFile = (args[2] !== cb) ? args[2] || 'CHANGES.rst' : fileName;

  if (!release) {
    console.log('Not doing anything. bye');
    if (typeof cb ==='function') { cb() };
    deferred.reject();
    return null;
  }

  console.log('Updating Changelog');
 
  read(fileName, 'utf8')
    .then(findLine)
    .then(function (options) {
      options.release = release;
      return insertLines(options);
      })
    .then(function (data) {
      writeLines(outFile, data);
      deferred.resolve();
      return;
      });

  
  return deferred.promise
};


module.exports = updateChangelog;
