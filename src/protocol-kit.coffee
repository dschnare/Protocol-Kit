'use strict'

isArray = Array.isArray or (a) -> Object::toString.call(a) is '[object Array]'

# Add built-in custom property rules.
propertyRules = [
  # Support property rules of the form:
  #  'enum{value1,value2,value3} or ['enum{', value1, value2, value3, '}]
  {
    match: (rule) ->
      (typeof rule is 'string'and
        rule.substr(0, 5) is 'enum{') or
        (isArray(rule) and
          rule.length > 2 and
          rule[0] is 'enum{' and
          rule[rule.length - 1] is '}')
    test: (rule, value) ->
      pass = false

      if typeof rule is 'string'
        rule = ['enum{'].concat(rule.substr(5).split(',')).concat(['}'])

      for i in [rule.length - 2...0] by -1
        pass = value is rule[i]
        break if pass

      return pass
  }
]

# Helper method to invoke a custom property rule
# that matches the specified rule.
propertyRules.invoke = (rule, ruleName, instance) ->
  for v in @
    return v.test rule, ruleName, instance if v.match rule
  return false

rules =
  # Add support for optional properties.
  '@optional': (descriptor, instance, testPropertyRule) ->
    pass = true

    for own ruleName of descriptor
      if instance[ruleName]?
        pass = testPropertyRule ruleName, descriptor, instance
        break unless pass

    return pass
  # Add support for choosing a single property from a set of properties.
  '@either-or': (descriptor, instance, testPropertyRule) ->
    hasRules = false
    propertyCount = 0

    for own ruleName of descriptor
      hasRules = true
      if instance[ruleName]?
        propertyCount += 1 if testPropertyRule ruleName, descriptor, instance
      break if propertyCount > 1

    return if hasRules then propertyCount is 1 else true

computeRule = (o) ->
  rule = typeof o
  rule = 'null' if o is null
  rule = 'array' if isArray o
  rule = o.constructor if rule is 'object'
  rule = computeArrayRule o if rule is 'array'
  return rule

computeArrayRule = (array) ->
  t = null
  homogenous = true

  for i in [array.length - 1..0] by -1
    if t
      temp = computeRule array[i]
      homogenous = testTypes temp, t
    else
      t = computeRule array[i]
    break unless homogenous
  return if homogenous then [t] else 'array'

testTypes = (a, b) ->
  return testTypes a[0], b[0] if isArray(a) and isArray(b)
  return a is b

testRule = (ruleName, descriptor, instance) ->
  rule = descriptor[ruleName]
  if ruleName[0] is '@' and typeof rules[ruleName] is 'function'
    return rules[ruleName] descriptor[ruleName], instance, testRule
  else
    return testPropertyRule ruleName, descriptor, instance

testPropertyRule = (ruleName, descriptor, instance) ->
  pass = instance?
  rule = descriptor[ruleName]

  return pass unless pass

  value = instance[ruleName]

  switch rule
    when 'null' then pass = value is null
    when 'string'
      pass = typeof value is 'string' or value instanceof String
    when 'number'
      pass = typeof value is 'number' or value instanceof Number
    when 'int'
      pass = (typeof value is 'number' or value instanceof Number) and
        value % 1 is 0
    when 'boolean'
      pass = typeof value is 'boolean' or value instanceof Boolean
    when 'array' then pass = isArray value
    when 'function' then pass = typeof value is 'function'
    when 'object'
      pass = value? and typeof value is 'object' and not isArray value
    when '*' then pass = value?
    else
      # Null: Example null
      if rule is null
        pass = value is null
      # Constructor rule: Example String, RegExp, Date
      else if typeof rule is 'function'
        pass = value instanceof rule
      # Homogenous array rule: Example [String], ['string'], ['int']
      else if isArray(rule) and rule.length is 1
        pass = do (array = value, rule = rule[0]) ->
          p = isArray array
          for value in array
            break unless p
            p = pk(a:rule).describes(a:value)
          return p
      # Protocol rule: Example {describes: function(o) {...}}
      else if typeof rule?.describes is 'function'
        pass = rule.describes value
      # !!Unrecognized rule!! Attempt to run it through a custom property rule.
      else
        pass = propertyRules.invoke rule, value

  return pass

pk = (descriptor) ->
  descriptor: -> descriptor
  describes: (o) ->
    pass = true
    for own ruleName of descriptor
      pass = testRule ruleName, descriptor, o
      break unless pass
    return pass

pk.registerRule = (name, handler) ->
  if typeof name is 'string' and typeof handler is 'function'
    rules['@' + name] = handler
    return true
  return false

pk.registerPropertyRule = (rule) ->
  if typeof rule?.match is 'function' and typeof rule.test is 'function'
    propertyRules.push rule
    return true
  return false

pk.from = (o) ->
  descriptor = {}
  for key,value of o
    descriptor[key] = computeRule value

  return pk descriptor

module.exports = pk