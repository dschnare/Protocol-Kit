Protocol-Kit
===============

Protocol Kit is a simple, convenient and EcmaScript 3 compliant protocol testing API for JavaScript.

Supports Nodejs, Bower, AMD and loading as a global browser `<script>`.



## Install

    bower install protocol-kit

Or

    npm install protocol-kit



## Example usage

Create a simple protocol for a user.

    var userProtocol = protocolKit({name: 'string', age: 'int'});
    var user = {name: 'Darren, age: 31};
   
    if (userProtocol.describes(person)) {
      // do stuff with person
    } else {
      // throw error
    }

Create a protocol that describes a group that must have a homogenous array of users.

    var groupProtocol = protocolKit({users: [userProtocol]});
    var group = {users: []};
    groupProtocol.describes(group); // true
    group.users.push({name: 'Darren', age: 31});
    group.users.push({name: 'Alex', age: 33});
    groupProtocol.describes(group); // true

If the users contains an element that is not a user then it will fail the protocol test.

    group.users.push('Dave, 35');
    groupProtocol.describes(group); // false

Let's update our "user" protocol so that each user can have a non-sparse, heterogenous array of "stuff".

    userProtocol.descriptor().stuff = ['*'];

Now each user must have at least an array of stuff, but it can be empty.

    groupProtocol.describes(group); // false
    group.users[0].stuff = [1, 2, '3'];
    group.users[1].stuff = new Array(10); // sparse array sized to 10 elements
    groupProtocol.describes(group); // false 

User at index 1 has an array of stuff, but it's sparse. We must set it to an empty array instead.

    group.users[1].stuff = [];
    groupProtocol.describes(group); // true

Let's add a timestamp to each group.

    group.timestamp = new Date();
    groupProtocol.describes(group); // true

Since the timestamp is not in the protocol the protocol still describes the group. But we can make the protocol include the timestamp.

    groupProtocol.descriptor().timestamp = Date;
    groupProtocol.describes(group); // true

Lastly, let's add an optional list of tags to each user using the '@optional' custom rule.

    userProtocol.descriptor()['@optional'] = {tags: ['string']};
    group.users[0].tags = ['male', 'computer science'];
    groupProtocol.descriptor(group); // true

The group protocol still describes the group because user tags are optional, but when the tags array does exist it must be a homogenous array of strings.

    group.usrs[1].tags = [1, 'slacker'];
    groupProtocol.describes(group); // false

## Reference

    protocolKit(protocolDescriptor)
    protocolKit.from(object)
    protocolKit.registerRule(name, handler)

    protocol.descriptor()
    protocol.describes(object)

## Rules 

When creating a protocol you must describe the protocol using a protocol descriptor object. This object has all the rules you would like an object to have in order to adhere to the protocol.

Each rule in a protocol descriptor may can describe a property or a custom descriptor rule. All custom descriptor rules must start with '@', all other descriptor rules are property rules.
Property rules can be one of the following values: 

    'null' = This property must be null
    'string' = This property must either be a string literal or a String object
    'number' = This property must either be a number literal or a Number object
    'int' = This property must either be an integer literal or an integer Number object
    'boolean' = This property must either be a boolean literal or a Boolean object
    'function' = This property must be a function
    'array' = This property must be a homogenous or heterogenous and/or sparse array with any number of elements
    'object' = This property must be an object with a prototype (literals will fail)
    '*' = This property must be non-null and defined
    constructor function = This property must be an instance of the specified constructor
    [any supported type] = This property must be a homogenous array whos' elements must be the type specified by the first element
    another protocol = This property must pass the describes() test of another protocol

### Custom Rules

Custom rules are rules that start with '@' and opperate on a group of property rules. Custom rules accept a protocol descriptor of property rules (i.e. no nested custom rules). The following custom rules are supported by default:

    '@optional' - This rule passes if all property rules that can be applied pass. Only if the property exists will a rule apply.
    '@either-or' - This rule passes only if one and only one of its property rules passes.
 
**Examples:**

    // Optional properties
    protocolKit({
      name: 'string',
      '@optional': { 
        age: 'int', 
        gender: 'string' 
      }
    });

    // Either-or (i.e. one-of from a set of properties)
    protocolKit({
      name: 'string',
      '@either-or': {
        male: 'boolean',
        female: 'boolean'
      }
    });

#### Registering Custom Rules

To register custom rules you would call `protocolKit.registerRule()` with your rule name and rule handler. The rule handler must accept the following arguments:

- descriptor = The descriptor that is the value of the custom rule.
- instance = The instance being tested.
- testPropertyRule = The function used to test each property rule in the descriptor.

The `testPropertyRule` function has the following signature:

    testPropertyRule(ruleName, descriptor, instance)

This function will return `true` or `false` depending if the property rule pases.

*NOTE: Although it is the intention that descriptor be an object with property rules, this value can be anything that the custom rule accepts.*

The custom rule handler function must return `true` if the rule passes and `false` otherwise.

`protocolKit.registerRule()` will not register rules with the same name and will return `false` if an attempt is made to do so or if the arguments are not of the expected type. This function returns `true` otherwise.

**Example:**

    // Add a custom rule to support enumeration properties.
    protocolKit.registerRule('enums', function (descriptor, instance, test) {
      var ruleName, rule, pass;

      pass = true;

      for (ruleName in descriptor) {
        rule = descriptor[ruleName];

        if (typeof rule === 'string' && rule.charAt(0) === '#') {
          supportedValues = rule.substr(1) + ',';
          pass = supportedValues.indexOf(instance[ruleName]) >= 0;
        } else {
          pass = test(ruleName, descriptor, instance);
        }

        if (!pass) { break; }
      }

      return pass;
    });
          
    // Usage
    protocolKit({
      '@enums': {
        type: '#circle,rectangle,triangle'
      },
      width: 'number',
      height: 'number',
      color: 'int'
    });
