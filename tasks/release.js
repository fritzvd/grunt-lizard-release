var release = require('release-it');
var changelog = require('../lib/changelog');
var semver = require('semver');
var Promise = require('promise');
var shell = require('shell');

module.exports = function (grunt) {
  grunt.registerTask('lizard-release', 'Checkout checkin, commit, changelog all the things release', function (type) {
  
    var newVersion;

    function setup(type) {
      var pkg = grunt.file.readJSON('package.json');
      newVersion = pkg.version;

      if (options.bump) {
        newVersion = semver.inc(pkg.version, type || 'patch');
      }


      return {
        pkg: pkg
      }


      function bumpPackage (options) {
        options.pkg.version = newVersion;
        grunt.file.write('package.json', JSON.stringify(
            options.pkg, null, 2) + '\n');
      };

      function commitChanges () {
        return shell.exec('git commit -am "Changed package.json and changelog to ' + newVersion +' "', {silent:false})
      };

      function newBranch () {
        return shell.exec('git checkout -b build_branch');
      };

      function changeGitIgnore () {
        return shell.exec('mv .buildignore .gitignore');
      };

      function addDist () {
        return shell.exec('git add dist/');
      }

      function subTreePush () {
        return shell.exec('git subtree push --prefix dist/ origin dist');
      }

      function checkoutDist () {
        return shell.exec('git checkout dist');
      };

      function tag () {
        return shell.exec('git tag ' + newVersion);
      }

      function removeDist () {
        return shell.exec('git push origin :dist --tags');
      }

      function removeBuildBranch () {
        return shell.exec('git branch -D build_branch');
      };

      function run () {
        var promise = new Promise(setup)
          .then(bumpPackage)
          .then(function () {
            return changelog(newVersion, function () {
              console.log(' i haz updated changelog to: ' + newVersion);
            });
          })
          .then(commitChanges)
          .then(newBranch)
          .then(changeGitIgnore)
          .then(addDist)
          .then(subTreePush)
          .then(checkoutDist)
          .then(tag)
          .then(removeDist)
          .then(removeBuildBranch);
      }
    };

  });
};
