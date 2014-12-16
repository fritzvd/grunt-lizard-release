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
    changelog({
      release: '0.2.3',
      inFile: 'tests/unreleased.txt',
      outFile: 'tests/release.txt'
    });
};
