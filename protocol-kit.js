(function (global) {
  'use strict';
  
  var isArray, computeRule, testRule, testPropertyRule, rules, propertyRules;

  // Add built-in custom property rules.
  propertyRules = [
    // Support property rules of the form: 'enum{value1,value2,value3} or ['enum{', value1, value2, value3, '}]
    {
      match: function (rule) {
        return (typeof rule === 'string' && rule.substr(0, 5) === 'enum{') || 
          (isArray(rule) && rule.length > 2 && rule[0] === 'enum{' && rule[rule.length - 1] === '}');
      }, 
      test: function (rule, value) {
        var i, pass;

        pass = false;

        if (typeof rule === 'string') {
          rule = ['enum{'].concat(rule.substr(5).split(',')).concat(['}']);
        }

        for (i = rule.length - 2; !pass && i > 0; i -= 1) {
          pass = value === rule[i];
        }

        return pass;
      }
    }
  ];
  // Helper method to invoke a custom property rule that matches the specified rule.
  propertyRules.invoke = function (rule, ruleName, instance) {
    var i, len;

    len = this.length;
    for (i = 0; i < len; i += 1) {
      if (this[i].match(rule)) {
        return this[i].test(rule, ruleName, instance);
      }
    }

    return false;
  };

  // Add built-in custom rules.
  rules = {
    // Add support for optional properties.
    '@optional': function (descriptor, instance, testPropertyRule) {
      var ruleName, pass;

      pass = true;

      for (ruleName in descriptor) {
        if (instance[ruleName] !== undefined && instance[ruleName] !== null) {
          pass = testPropertyRule(ruleName, descriptor, instance);
          if (!pass) { break; }
        }
      }

      return pass;
    },
    // Add support for choosing a single property from a set of properties.
    '@either-or': function (descriptor, instance, testPropertyRule) {
      var ruleName, hasRules, propertyCount;

      hasRules = false;
      propertyCount = 0;

      for (ruleName in descriptor) {
        hasRules = true;

        if (instance[ruleName] !== null && instance[ruleName] !== undefined) {
          if (testPropertyRule(ruleName, descriptor, instance)) {
            propertyCount += 1;
          }
        }

        if (propertyCount > 1) { break; }
      }

      return hasRules ? propertyCount === 1 : true;
    }
  };

  isArray = Array.isArray || (function (toString) {
    return function (o) { return toString.call(o) === '[object Array]'; };
  }(Object.prototype.toString));

  computeRule = function (o) {
    var rule;

    rule = typeof o;
    if (o === null) rule = 'null';
    if (isArray(o)) rule = 'array';
    if (rule === 'object') rule = o.constructor;
    if (rule === 'array') {
      rule = (function (array) {
        var i, t, temp, homogenous;

        homogenous = true;

        for (i = array.length - 1; i >= 0 && homogenous; i -= 1) {
          if (t) {
            temp = computeRule(array[i]);
            homogenous = (function rec(t1, t2) {
              if (isArray(t1) && isArray(t2)) {
                return rec(t1[0], t2[0]);
              }

              return t1 === t2;
            }(temp, t));
          } else {
            t = computeRule(array[i]);
          }
        }

        return homogenous ? [t] : 'array';
      }(o));
    }

    return rule;
  };

  testRule = function (ruleName, descriptor, instance) {
    var rule; 

    rule = descriptor[ruleName];

    if (ruleName.charAt(0) === '@' && typeof rules[ruleName] === 'function') {
      return rules[ruleName](descriptor[ruleName], instance, testRule);
    } else {
      return testPropertyRule(ruleName, descriptor, instance);
    }
  };

  testPropertyRule = function (ruleName, descriptor, instance) {
    var pass, rule, value;

    pass = instance !== null && instance !== undefined;
    rule = descriptor[ruleName];

    if (!pass) {
      return pass;
    }

    value = instance[ruleName];

    switch (rule) {
      case 'null':
        pass = value === null;
        break;
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
        // Null: Example null
        if (rule === null) {
          pass = value === null;
        // Constructor rule: Example String, RegExp, Date, Function
        } else if (typeof rule === 'function') {
          pass = value instanceof rule;
        // Homogenous array rule: Example [String], ['string'], ['int']
        } else if (isArray(rule) && rule.length === 1) {
          pass = (function (array, rule) {
            var i, pass;

            pass = isArray(array);

            for (i = array.length - 1; i >= 0 && pass; i -= 1) {
              pass = protocolKit({ a: rule }).describes({ a: array[i] });
            }

            return pass;
          }(value, rule[0]));
        // Protocol rule: Example {describes: function(o) {...}}
        } else if (!!rule && typeof rule.describes === 'function') {
          pass = rule.describes(value);
        // !!Unrecognized rule!! Attempt to run it through a custom property rule.
        } else {
          pass = propertyRules.invoke(rule, value);
        }
    }

    return pass;
  };

  function protocolKit(descriptor) {
    return {
      descriptor: function () {
        return descriptor;
      },
      describes: function (o) {
        var ruleName, pass;

        pass = true;

        for (ruleName in descriptor) {
          pass = testRule(ruleName, descriptor, o);
          if (!pass) { break; }
        }

        return pass;
      }
    };
  }

  protocolKit.registerRule = function (name, handler) {
    if (typeof name === 'string' && typeof handler === 'fnction' && typeof rules[name] !== 'function') {
      rules['@' + name] = handler;
      return true;
    }

    return false;
  };

  protocolKit.registerPropertyRule = function (rule) {
    if (rule && typeof rule.match === 'function' && typeof rule.test === 'function') {
      propertyRules.push(rule);
      return true;
    }

    return false;
  };

  protocolKit.from = function (o) {
    var key, value, descriptor;

    descriptor = {};

    for (key in o) {
      value = o[key];
      descriptor[key] = computeRule(value);
    }

    return protocolKit(descriptor);
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
