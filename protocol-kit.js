'use strict';
var computeArrayRule, computeRule, isArray, pk, propertyRules, rules, testPropertyRule, testRule, testTypes,
  __hasProp = {}.hasOwnProperty;

isArray = Array.isArray || function(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
};

propertyRules = [
  {
    match: function(rule) {
      return (typeof rule === 'string' && rule.substr(0, 5) === 'enum{') || (isArray(rule) && rule.length > 2 && rule[0] === 'enum{' && rule[rule.length - 1] === '}');
    },
    test: function(rule, value) {
      var i, pass, _i, _ref;
      pass = false;
      if (typeof rule === 'string') {
        rule = ['enum{'].concat(rule.substr(5).split(',')).concat(['}']);
      }
      for (i = _i = _ref = rule.length - 2; _i > 0; i = _i += -1) {
        pass = value === rule[i];
        if (pass) {
          break;
        }
      }
      return pass;
    }
  }
];

propertyRules.invoke = function(rule, ruleName, instance) {
  var v, _i, _len;
  for (_i = 0, _len = this.length; _i < _len; _i++) {
    v = this[_i];
    if (v.match(rule)) {
      return v.test(rule, ruleName, instance);
    }
  }
  return false;
};

rules = {
  '@optional': function(descriptor, instance, testPropertyRule) {
    var pass, ruleName;
    pass = true;
    for (ruleName in descriptor) {
      if (!__hasProp.call(descriptor, ruleName)) continue;
      if (instance[ruleName] != null) {
        pass = testPropertyRule(ruleName, descriptor, instance);
        if (!pass) {
          break;
        }
      }
    }
    return pass;
  },
  '@either-or': function(descriptor, instance, testPropertyRule) {
    var hasRules, propertyCount, ruleName;
    hasRules = false;
    propertyCount = 0;
    for (ruleName in descriptor) {
      if (!__hasProp.call(descriptor, ruleName)) continue;
      hasRules = true;
      if (instance[ruleName] != null) {
        if (testPropertyRule(ruleName, descriptor, instance)) {
          propertyCount += 1;
        }
      }
      if (propertyCount > 1) {
        break;
      }
    }
    if (hasRules) {
      return propertyCount === 1;
    } else {
      return true;
    }
  }
};

computeRule = function(o) {
  var rule;
  rule = typeof o;
  if (o === null) {
    rule = 'null';
  }
  if (isArray(o)) {
    rule = 'array';
  }
  if (rule === 'object') {
    rule = o.constructor;
  }
  if (rule === 'array') {
    rule = computeArrayRule(o);
  }
  return rule;
};

computeArrayRule = function(array) {
  var homogenous, i, t, temp, _i, _ref;
  t = null;
  homogenous = true;
  for (i = _i = _ref = array.length - 1; _i >= 0; i = _i += -1) {
    if (t) {
      temp = computeRule(array[i]);
      homogenous = testTypes(temp, t);
    } else {
      t = computeRule(array[i]);
    }
    if (!homogenous) {
      break;
    }
  }
  if (homogenous) {
    return [t];
  } else {
    return 'array';
  }
};

testTypes = function(a, b) {
  if (isArray(a) && isArray(b)) {
    return testTypes(a[0], b[0]);
  }
  return a === b;
};

testRule = function(ruleName, descriptor, instance) {
  var rule;
  rule = descriptor[ruleName];
  if (ruleName[0] === '@' && typeof rules[ruleName] === 'function') {
    return rules[ruleName](descriptor[ruleName], instance, testRule);
  } else {
    return testPropertyRule(ruleName, descriptor, instance);
  }
};

testPropertyRule = function(ruleName, descriptor, instance) {
  var pass, rule, value;
  pass = instance != null;
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
      pass = (typeof value === 'number' || value instanceof Number) && value % 1 === 0;
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
      pass = (value != null) && typeof value === 'object' && !isArray(value);
      break;
    case '*':
      pass = value != null;
      break;
    default:
      if (rule === null) {
        pass = value === null;
      } else if (typeof rule === 'function') {
        pass = value instanceof rule;
      } else if (isArray(rule) && rule.length === 1) {
        pass = (function(array, rule) {
          var p, _i, _len;
          p = isArray(array);
          for (_i = 0, _len = array.length; _i < _len; _i++) {
            value = array[_i];
            if (!p) {
              break;
            }
            p = pk({
              a: rule
            }).describes({
              a: value
            });
          }
          return p;
        })(value, rule[0]);
      } else if (typeof (rule != null ? rule.describes : void 0) === 'function') {
        pass = rule.describes(value);
      } else {
        pass = propertyRules.invoke(rule, value);
      }
  }
  return pass;
};

pk = function(descriptor) {
  return {
    descriptor: function() {
      return descriptor;
    },
    describes: function(o) {
      var pass, ruleName;
      pass = true;
      for (ruleName in descriptor) {
        if (!__hasProp.call(descriptor, ruleName)) continue;
        pass = testRule(ruleName, descriptor, o);
        if (!pass) {
          break;
        }
      }
      return pass;
    }
  };
};

pk.registerRule = function(name, handler) {
  if (typeof name === 'string' && typeof handler === 'function') {
    rules['@' + name] = handler;
    return true;
  }
  return false;
};

pk.registerPropertyRule = function(rule) {
  if (typeof (rule != null ? rule.match : void 0) === 'function' && typeof rule.test === 'function') {
    propertyRules.push(rule);
    return true;
  }
  return false;
};

pk.from = function(o) {
  var descriptor, key, value;
  descriptor = {};
  for (key in o) {
    value = o[key];
    descriptor[key] = computeRule(value);
  }
  return pk(descriptor);
};

module.exports = pk;
