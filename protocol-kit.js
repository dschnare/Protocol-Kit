(function (global) {
  'use strict';
  
  var isArray, getType;

  isArray = Array.isArray || (function (toString) {
    return function (o) { return toString.call(o) === '[object Array]'; };
  }(Object.prototype.toString));

  getType = function (o) {
    var type;

    type = typeof o;
    if (o === null) type = 'null';
    if (isArray(o)) type = 'array';
    if (type === 'object') type = o.constructor;
    if (type === 'array') {
      type = (function (array) {
        var i, t, temp, homogenous;

        homogenous = true;

        for (i = array.length - 1; i >= 0 && homogenous; i -= 1) {
          if (t) {
            temp = getType(array[i]);
            homogenous = (function rec(t1, t2) {
              if (isArray(t1) && isArray(t2)) {
                return rec(t1[0], t2[0]);
              }

              return t1 === t2;
            }(temp, t));
          } else {
            t = getType(array[i]);
          }
        }

        return homogenous ? [t] : 'array';
      }(o));
    }

    return type;
  };

  function protocolKit(description) {
    return {
      describe: function () {
        return description;
      },
      describes: function (o) {
        var key, type, value, pass;

        pass = o !== null && o !== undefined;

        for (key in description) {
          if (!pass) break;

          type = description[key];
          value = o[key];
          
          switch (type) {
            case 'string':
              pass = typeof value === 'string' || value instanceof String;
              break;
            case 'number':
              pass = typeof value === 'number' || value instanceof Number;
              break;
            case 'int':
              pass = (typeof value === 'number' || value instanceof Number) && value % 1 === 0
              break;
            case 'boolean':
              pass = typeof value === 'boolean' || value instanceof Boolean;
              break;
            case 'array':
              pass = isArray(value);
              break;
            case 'function':
              pass = typeof value === 'function';
              break;
            case 'object':
              pass = !!value && typeof value === 'object' && !isArray(value);
              break;
            case '*':
              pass = value !== undefined && value !== null;
              break;
            default:
              // Constructor type: Example String, RegExp, Date, Function
              if (typeof type === 'function') {
                pass = value instanceof type;
              // Homogenous array type: Example [String], ['string'], ['int']
              } else if (isArray(type) && type.length === 1) {
                pass = (function (array, type) {
                  var i, pass;

                  pass = isArray(array);

                  for (i = array.length - 1; i >= 0 && pass; i -= 1) {
                    pass = protocolKit({ a: type }).describes({ a: array[i] });
                  }

                  return pass;
                }(value, type[0]));
              // Optional type: Example {'?': 'string'}, {'?': 'object'}, {'?': Date}
              } else if (!!type && !!type['?']) {
                if (value !== null && value !== undefined) {
                  pass = protocolKit({ a: type['?'] }).describes({ a: value });
                }
              // Protocol type: Example {describes: function(o) {...}}
              } else if (!!type && typeof type.describes === 'function') {
                pass = type.describes(value);
              }
          }
        }

        return pass;
      }
    };
  }

  protocolKit.from = function (o) {
    var key, value, description;

    description = {};

    for (key in o) {
      value = o[key];
      description[key] = getType(value);
    }

    return protocolKit(description);
  };

  if (typeof exports === 'object' && exports) {
    exports.protocolKit = protocolKit;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return protocolKit;
    });
  } else {
    global.protocolKit = protocolKit;
  }
}(this));
