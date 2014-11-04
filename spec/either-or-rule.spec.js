var pk = require('../protocol-kit')

describe('@either-or rule', function () {
  it('should create a protocol for a set of properties where only one of the set can exist using the "@either-or" rule', function () {
    var protocol = pk({
      '@either-or': {
        a: 'number',
        b: 'string'
      }
    });

    expect(protocol.describes({a: 34})).toBe(true);
    expect(protocol.describes(Object.create({a: 20}))).toBe(true);
    expect(protocol.describes({b: 'a string'})).toBe(true);
    expect(protocol.describes({b: 24})).toBe(false);
    expect(protocol.describes({a: 'a string'})).toBe(false);
    expect(protocol.describes({a: 10, b: 'a string'})).toBe(false);
  });
});
