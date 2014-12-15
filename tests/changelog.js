var test = require('tape');
var changelog = require('../lib/changelog');


var testHeader = function (line) {
  test('Change header of changelog', function (t) {
    t.plan(1);

    t.equal('Unreleased ()', line)
  });
};


module.exports = function () {
  changelog.updateChangelog('tests/unreleased.txt', '0.2.3', 'tests/release.txt', function () {
    console.log(arguments);
  });

  //testHeader(changelog.header('tests/unreleased.txt'));
};
