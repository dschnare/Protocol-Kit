var pk = require('../protocol-kit')

describe('pk', function () {
  it('should create a protocol for string literals and String objects using the simple type "string"', function () {
    var protocol = pk({
      a: 'string'
    });

    expect(protocol.describes({a: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: ''}))).toBe(true);
    expect(protocol.describes({a: new String()})).toBe(true);
    expect(protocol.describes({a: '', b: 4, c: false})).toBe(true);
    expect(protocol.describes(Object.create({a: '', b: 4, c: false}))).toBe(true);
    expect(protocol.describes({a: 4})).toBe(false);
    expect(protocol.describes({a: false})).toBe(false);
  });

  it('should create a protocol for null literals using the simple type "null"', function () {
    var protocol = pk({
      a: 'null'
    });

    expect(protocol.describes({a: null})).toBe(true);
    expect(protocol.describes(Object.create({a: null}))).toBe(true);
    expect(protocol.describes({a: null, b: 4, c: false})).toBe(true);
    expect(protocol.describes(Object.create({a: null, b: 4, c: false}))).toBe(true);
    expect(protocol.describes({a: 4})).toBe(false);
    expect(protocol.describes({a: false})).toBe(false);
    expect(protocol.describes({b: 'hi'})).toBe(false);
  });

  it('should create a protocol for boolean literals and Boolean objects using the simple type "boolean"', function () {
    var protocol = pk({
      a: 'boolean'
    });

    expect(protocol.describes({a: true})).toBe(true);
    expect(protocol.describes(Object.create({a: false}))).toBe(true);
    expect(protocol.describes({a: new Boolean(false)})).toBe(true);
    expect(protocol.describes({a: false, b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: false, b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: 0})).toBe(false);
  });

  it('should create a protocol for number literals and Number objects using the simple type "number"', function () {
    var protocol = pk({
      a: 'number'
    });

    expect(protocol.describes({a: 35})).toBe(true);
    expect(protocol.describes(Object.create({a: 45.5}))).toBe(true);
    expect(protocol.describes({a: new Number(52.5)})).toBe(true);
    expect(protocol.describes({a: new Number(53), b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: -1, b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: true})).toBe(false);
  });

  it('should create a protocol for integer literals and integer Number objects using the simple type "int"', function () {
    var protocol = pk({
      a: 'int'
    });

    expect(protocol.describes({a: 35})).toBe(true);
    expect(protocol.describes(Object.create({a: 45}))).toBe(true);
    expect(protocol.describes({a: new Number(52)})).toBe(true);
    expect(protocol.describes({a: new Number(53), b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: -1, b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: 5.6})).toBe(false);
    expect(protocol.describes({a: -3.4})).toBe(false);
    expect(protocol.describes({a: '34'})).toBe(false);
  });

  it('should create a protocol for arrays using the simple type "array"', function () {
    var protocol = pk({
      a: 'array'
    });

    expect(protocol.describes({a: []})).toBe(true);
    expect(protocol.describes(Object.create({a: [1, '2', true]}))).toBe(true);
    expect(protocol.describes({a: new Array(2)})).toBe(true);
    expect(protocol.describes({a: new Array(), b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: [], b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: true})).toBe(false);
  });

  it('should create a protocol for functions using the simple type "function"', function () {
    var protocol = pk({
      a: 'function'
    });

    expect(protocol.describes({a: expect})).toBe(true);
    expect(protocol.describes(Object.create({a: expect}))).toBe(true);
    expect(protocol.describes({a: expect,  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: expect, b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: true})).toBe(false);
  });

  it('should create a protocol for objects using the simple type "object"', function () {
    var protocol = pk({
      a: 'object'
    });

    expect(protocol.describes({a: {}})).toBe(true);
    expect(protocol.describes(Object.create({a: {}}))).toBe(true);
    expect(protocol.describes({a: {},  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: new String(), b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: []})).toBe(false);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: null})).toBe(false);
  });

  it('should create a protocol for property existance using the simple type "*"', function () {
    var protocol = pk({
      a: '*'
    });

    expect(protocol.describes({a: {}})).toBe(true);
    expect(protocol.describes(Object.create({a: 4}))).toBe(true);
    expect(protocol.describes({a: false,  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: new String(), b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: null})).toBe(false);
    expect(protocol.describes({a: undefined})).toBe(false);
  });

  it('should create a protocol for "instanceof" using a constructor as a  type', function () {
    var protocol = pk({
      a: String
    });

    expect(protocol.describes({a: new String()})).toBe(true);
    expect(protocol.describes(Object.create({a: new String()}))).toBe(true);
    expect(protocol.describes({a: new String(),  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: new String(), b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ''})).toBe(false);
    expect(protocol.describes({a: new Array()})).toBe(false);
  });

  it('should create a protocol for a homogenous array using a single-element array as a type', function () {
    var protocol = pk({
      a: ['number']
    });

    expect(protocol.describes({a: [4]})).toBe(true);
    expect(protocol.describes(Object.create({a: [54.5]}))).toBe(true);
    expect(protocol.describes({a: [],  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: new Array(), b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ['4']})).toBe(false);
    expect(protocol.describes({a: '4'})).toBe(false);
  });

  it('should create a protocol for a non-sparse array using a single-element array with "*" as a type', function () {
    var protocol = pk({
      a: ['*']
    });

    expect(protocol.describes({a: [4, 3, 2, 1]})).toBe(true);
    expect(protocol.describes(Object.create({a: [54.5, 4]}))).toBe(true);
    expect(protocol.describes({a: [],  b: 34, c: 'a string'})).toBe(true);
    expect(protocol.describes(Object.create({a: new Array(), b: 34, c: 'a string'}))).toBe(true);
    expect(protocol.describes({a: ['4', null, 1, 2]})).toBe(false);
    expect(protocol.describes({a: ['4', 1, 2, undefined]})).toBe(false);
    expect(protocol.describes({a: '4'})).toBe(false);
    expect(protocol.describes({a: new Array(10)})).toBe(false);
  });

  it('should create a protocol for a property who\'s type is a protocol', function () {
    var protocol = pk({
      a: pk({b: pk({c: 'string'})})
    });
    var a = [], b = [];
    a.b = b;
    b.c = 'a string';

    expect(protocol.describes({a: {b: {c: 'c'}}})).toBe(true);
    expect(protocol.describes(Object.create({a: {b: Object.create({c: 'c'})}}))).toBe(true);
    expect(protocol.describes({a: a})).toBe(true);
    expect(protocol.describes({a: ['4']})).toBe(false);
    expect(protocol.describes({a: 4})).toBe(false);
    expect(protocol.describes({b: 'a string'})).toBe(false);
    expect(protocol.describes({a: {b: {c: 4}}})).toBe(false);
    expect(protocol.describes({a: {b: []}})).toBe(false);
  });

  it('should create a protocol from an existing instance object', function () {
    var protocol = pk.from({
      a: 'a string', // 'string'
      b: 4, // 'number'
      c: new Date(), // Date
      d: [1, '2', true, [1, 2, 3]], // 'array'
      e: [['a', 'b', 'c'], ['1']], // [['string']] (array of array of strings)
      f: null
    });
    var description = protocol.descriptor();

    expect(description.a).toBe('string');
    expect(description.b).toBe('number');
    expect(description.c).toBe(Date);
    expect(description.d).toBe('array');
    expect(Object.prototype.toString.call(description.e)).toBe('[object Array]');
    expect(Object.prototype.toString.call(description.e[0])).toBe('[object Array]');
    expect(description.e[0][0]).toBe('string');
    expect(description.f).toBe('null');
  });
});
