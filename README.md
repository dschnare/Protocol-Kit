Protocol-Kit
===============

Protocol Kit is a simple, convenient and EcmaScript 3 compliant protocol testing API for JavaScript.

Supports Nodejs, Bower, AMD and loading as a global browser `<script>`.



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

    userProtocol.describe().stuff = ['*'];

Now each user must have at least an array of stuff, but it can be empty.

    groupProtocol.describes(group); // false
    group.users[0].stuff = [1, 2, '3'];
    group.users[1].stuff = new Array(10); // sparse array sized to 10 elements
    groupProtocol.describes(group); // false

Oops. User at index 1 has an array of stuff, but it's sparse. So we can set it to an empty array instead.

    group.users[1].stuff = [];
    groupProtocol.describes(group); // true

Let's add a timestamp to each group.

    group.timestamp = new Date();
    groupProtocol.describes(group); // true

Since the timestamp is not in the protocol the protocol still describes the group. But we can make the protocol include the timestamp.

    groupProtocol.describe().timestamp = Date;
    groupProtocol.describes(group); // true

## Reference

    protocolKit(description)
    protocolKit.from(object)

    protocol.describe()
    protocol.describes(object)

## Supported Types

When creating a protocol you must describe the protocol using a protocol description object. This object has all the properties you would like an object to have in order to adhere to the protocol.

Each property in a protocol description can be one of the following types (the meaning follows each type):

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
    {'?': any supported type} = This property may or may not exist (i.e. optional), but if it does exist then it must be the type specified by the '?' key
    another protocol = This property must pass the describes() test of another protocol
