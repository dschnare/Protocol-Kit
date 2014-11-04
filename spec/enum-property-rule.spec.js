var pk = require('../protocol-kit')

describe('enum property rule', function () {
  it('should describe a protocol for enumeration properties using the enum property rule as a string', function () {
    var protocol = pk({
      type: 'enum{circle,triangle,rectangle,sphere}',
      render: 'function',
      color: 'number'
    });

    expect(protocol.describes({
      type: 'circle',
      color: 0,
      render: function () {}
    })).toBe(true);

    expect(protocol.describes({
      type: 'rectangle',
      color: 100,
      render: function () {}
    })).toBe(true);


    expect(protocol.describes({
      type: 'unsupported',
      color: 100,
      render: function () {}
    })).toBe(false);
  });


  it('should describe a protocol for enumeration properties using the enum property rule as an array', function () {
    var protocol = pk({
      type: ['enum{', 'circle', 'triangle', 'rectangle', 'sphere', '}'],
      render: 'function',
      color: 'number'
    });

    expect(protocol.describes({
      type: 'circle',
      color: 0,
      render: function () {}
    })).toBe(true);

    expect(protocol.describes({
      type: 'rectangle',
      color: 100,
      render: function () {}
    })).toBe(true);


    expect(protocol.describes({
      type: 'unsupported',
      color: 100,
      render: function () {}
    })).toBe(false);
  });
});
