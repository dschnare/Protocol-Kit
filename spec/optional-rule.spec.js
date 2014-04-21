describe('@optional rule', function () {
  it('should create a protocol for optional properties using the "@optional" rule', function () {
    var protocol = protocolKit({
      a: 'number',
      '@optional': {
        b: Number, 
        c: 'string'
      }
    });

    expect(protocol.describes({a: 34})).toBe(true);
    expect(protocol.describes(Object.create({a: 20}))).toBe(true);
    expect(protocol.describes({a: 10, b: new Number()})).toBe(true);
    expect(protocol.describes({a: 10, b: 24})).toBe(false);
    expect(protocol.describes({a: 10, b: new Number(), c: 'a string'})).toBe(true);
    expect(protocol.describes({a: 10, b: new Number(), c: 45})).toBe(false);
  });
});
