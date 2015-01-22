var changelog = require('../lib/changelog');
var semver = require('semver');
var Q = require('q');
var shell = require('shelljs');
var git = require('git-rev');

module.exports = function (grunt) {
  grunt.registerMultiTask(
    'releaser', 'Checkout checkin, commit, changelog all the things release',
  function (type) {

    var options = this.options();

    var done = this.async();
  
    var newVersion, newDevVersion, currentBranch;

    function getCurrentBranch(type) {
      var prom = Q.defer();

      git.branch(function (s) {
        prom.resolve({'currentBranch': s, 'type': type});
      });

      return prom.promise;
    }

    function setup(obj) {

      var pkg = grunt.file.readJSON('package.json');
      newVersion = pkg.version;
      newVersion = semver.inc(pkg.version, obj.type || 'patch');
      newDevVersion = newVersion + 'dev';
      currentBranch = obj.currentBranch;

      return pkg;
    }

    function bumpPackage(pkg) {
      pkg.version = newVersion;
      grunt.file.write('package.json', JSON.stringify(
          pkg, null, 2) + '\n');

      var bowerPkg = grunt.file.readJSON('bower.json');
      bowerPkg.version = newVersion;
      grunt.file.write('bower.json', JSON.stringify(
          bowerPkg, null, 2) + '\n');

      return newVersion;
    }

    function commitChanges() {
      console.log('committing');
      return shell.exec(
        'git commit -am "Changed package.json and changelog to ' +
        newVersion +
        ' "', {silent: false}
      );
    }

    function newBranch() {
      return shell.exec('git checkout -b build_branch');
    }

    function changeGitIgnore() {
      return shell.exec('mv .buildignore .gitignore');
    }

    function addDist() {
      return shell.exec('git add dist/');
    }

    function commitDist() {
      return shell.exec(
        'git commit -am "Releasing with Dist: ' + newVersion + ' "');
    }

    function subTreePush() {
      if (options.upstream === 'gh-pages') {
        shell.exec("git push origin :gh-pages --force")
      } 
      return shell.exec('git subtree push --prefix dist/ origin ' + options.upstream); 
    }

    function checkoutDist() {
      return shell.exec('git checkout origin/' + options.upstream);
    }

    function devTag() {
      return shell.exec(
        'git tag -a ' + newDevVersion +
        ' -m "New Release: ' + newDevVersion + '"');
    }

    function mergeDevTag() {
      return shell.exec('git merge ' + currentBranch + ' build_branch');
    }


    function tag() {
      return shell.exec(
        'git tag -a ' + newVersion + ' -m "New Release: ' + newVersion + '"');
    }

    function removeDist() {
      return shell.exec('git push origin :dist --tags');
    }

    function goBackToBranch() {
      return shell.exec('git checkout ' + currentBranch);
    }

    function removeBuildBranch() {
      return shell.exec('git branch -D build_branch');
    }

    var p = new Q();
    if (options.tag && options.changelog) {
      p.then(getCurrentBranch)
       .then(setup)
       .then(bumpPackage)
       .then(changelog)
       .then(commitChanges)
       .then(devTag)
       .then(mergeDevTag)
       .then(newBranch)
       .then(changeGitIgnore)
       .then(addDist)
       .then(commitDist)
       .then(subTreePush)
       .then(checkoutDist)
       .then(tag)
       .then(removeDist)
       .then(goBackToBranch)
       .then(removeBuildBranch)
       .done(done);
    } else {
      p.then(getCurrentBranch)
      .then(setup)
      .then(newBranch)
      .then(changeGitIgnore)
      .then(addDist)
      .then(commitDist)
      .then(subTreePush)
      .then(goBackToBranch)
      .then(removeBuildBranch)
      .done(done);
    }
  });
};
