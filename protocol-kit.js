(function (global) {
  'use strict';
  
  var isArray, computeRule, testRule, testPropertyRule, rules;

  rules = {
    '@optional': function (rule, instance, testPropertyRule) {
      var ruleName, pass;

      pass = true;

      for (ruleName in rule) {
        if (instance[ruleName] !== undefined && instance[ruleName] !== null) {
          pass = pass && testPropertyRule(ruleName, rule, instance);
          if (!pass) { break; }
        }
      }

      return pass;
    },
    '@either-or': function (rule, instance, testPropertyRule) {
      var ruleName, hasRules, propertyCount;

      hasRules = false;
      propertyCount = 0;

      for (ruleName in rule) {
        hasRules = true;

        if (instance[ruleName] !== null && instance[ruleName] !== undefined) {
          if (testPropertyRule(ruleName, rule, instance)) {
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

  testRule = function (ruleName, protocolDescriptor, instance) {
    var rule; 

    rule = protocolDescriptor[ruleName];

    if (ruleName.charAt(0) === '@' && typeof rules[ruleName] === 'function') {
      return rules[ruleName](protocolDescriptor[ruleName], instance, testRule);
    } else {
      return testPropertyRule(ruleName, protocolDescriptor, instance);
    }
  };

  testPropertyRule = function (ruleName, protocolDescriptor, instance) {
    var pass, rule, value;

    pass = instance !== null && instance !== undefined;
    rule = protocolDescriptor[ruleName];

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
        // !!Unrecognized rule!!
        } else {
          pass = false;
        }
    }

    return pass;
  };

  function protocolKit(protocolDescriptor) {
    return {
      describe: function () {
        return protocolDescriptor;
      },
      describes: function (o) {
        var ruleName, pass;

        pass = true;

        for (ruleName in protocolDescriptor) {
          pass = pass && testRule(ruleName, protocolDescriptor, o);
          
          if (!pass) {
            break;
          }
        }

        return pass;
      }
    };
  }

  protocolKit.from = function (o) {
    var key, value, protocolDescriptor;

    protocolDescriptor = {};

    for (key in o) {
      value = o[key];
      protocolDescriptor[key] = computeRule(value);
    }

    return protocolKit(protocolDescriptor);
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
