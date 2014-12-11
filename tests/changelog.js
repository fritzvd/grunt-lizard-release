var test = require('tape');
var changelog = require('../lib/changelog');



var testHeader = function (line) {
  test('Change header of changelog', function (t) {
    t.plan(1);

    t.equal('Unreleased ()', line)
  });
};


module.exports = function () {
  changelog
    .start('tests/unreleased.txt')
    .pipe(changelog.header)
/*    .on('data', function () {*/
      //console.log(arguments);
    /*});*/
    //.pipe(changelog.header);
};
