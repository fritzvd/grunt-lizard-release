var test = require('tape');
var changelog = require('../lib/changelog');


var testHeader = function (line) {
  console.log('henk');
  test('Change header of changelog', function (t) {
    t.plan(1);

    t.equal('succes', line)
  });
};


module.exports = function () {
  changelog.updateChangelog('tests/unreleased.txt',
      '0.2.3', 'tests/release.txt', testHeader);
};
