Property-Kit
===============

Property Kit is a simple, convenient and EcmaScript 3 compliant property construction API for JavaScript.

Supports Nodejs, Bower, AMD and loading as a global browser `<script>`.



## Example usage

    // NOTE: For your convenience you can use propertyKit() in place of
    // all calls to propertyKit.readwrite(). Each reference the same function.

    // Create a readwrite property.
    var age = propertyKit.readwrite(45);

    age(); // 45
    age(35);
    age(); // 35

    // Create a readwrite property that has a filter.
    // Filters are functions that are called when a property
    // is being set. Filters accept the new value and the 
    // old value and must return the result that will be the new
    // value of the property.
    // For this shape property we check to see if the value being set
    // is supported by checking if it exists in a list of supported enumerations.
    var shape = propertyKit.readwrite('none', function (newValue, oldValue) {
      return ['none', 'square', 'circle', 'rectangle'].indexOf(newValue) >= 0 ? newValue : oldValue;
    });

    shape(); // 'none'
    shape('circle');
    shape(); // 'circle'
    shape('quad');
    shape(); // 'circle'

    // ------------

    // Since readwrite properties are likely to be created frequently, propertyKit
    // when used as a function will call propertyKit.readwrite

    var name = propertyKit('Darren');
    name(); // 'Darren'
    name('Chris');
    name(); // 'Chris'

    // ------------

    // Create a readwrite property with a custom getter and setter.
    // When both the value and the filter are functions then
    // it is expected that they are a custom getter and setter function respectively.
    var me = {
      firstName: propertyKit('Darren'),
      lastName: propertyKit('Schnare'),
      fullName: propertyKit(function () {
        return this.firstName() + ' ' + this.lastName();
      }, function (newValue, oldValue) {
        var parts = (newValue + '').split(' ');

        if (parts.length === 2) {
          this.firstName(parts[0]);
          this.lastName(parts[1]);
        }
      })
    };

    me.fullName(); // 'Darren Schanre'
    me.firstName('John'); 
    me.fullName(); // 'John Schnare'
    me.fullName('Max Schnare');
    me.fullName(); // 'Max Schnare'

    // ------------

    // Create a readonly property.
    var id = propertyKit.readonly(10);

    id(); // 10
    id(11); // Error

    // ------------

    // Create a readonly property with a custom getter.
    var me = {
      firstName: propertyKit('Darren'),
      lastName: propertyKit('Schnare'),
      fullName: propertyKit.readonly(function () {
        return this.firstName() + ' ' + this.lastName();
      })
    };

    me.fullName(); // 'Darren Schnare'
    me.fullName('Mike Tyson'); // Error

    // ------------

    // Create a readonly property with a private write modifier.
    // The private write modifier requires that a key be used when
    // setting the property (the same key used to create the property).
    var key = {};
    var id = propertyKit.readonly(0, key);

    id(); // 0
    id(15); // Error()
    id(1, key);
    id(); // 1

    // ------------

    // Create a readonly property with a private write modifier and a filter.
    // For this property we check to see if the new value being set is an integer
    // and that it is >= 0, if it isn't then we set it to 0.
    var key2 = {};
    var id2 = propertyKit.readonly(0, function (newValue, oldValue) {
      newValue = parseInt(newValue, 10);

      if (newValue < 0 || isNaN(newValue)) {
        newValue = 0;
      }

      return newValue;
    }, key2);

    id2(); // 0
    id2(15); // Error
    id2(25, key);
    id2(); //25
    id2(-1, key);
    id2(); // 0

    // --------------

    // Create a readonly property with a private write modifier and a custom getter and setter.
    var key = {};
    var me = {
      firstName: propertyKit('Darren'),
      lastName: propertyKit('Schnare'),
      fullName: propertyKit.readonly(function () {
        return this.firstName() + ' ' + this.lastName();
      }, function (newValue, oldValue) {
        var parts = (newValue + '').split(' ');

        if (parts.length === 2) {
          this.firstName(parts[0]);
          this.lastName(parts[1]);
        }
      }, key)
    };

    me.fullName(); // 'Darren Schnare'
    me.fullName('Little Jon'); // Error
    me.fullName('Little Jon', key);
    me.fullName(); // 'Little Jon'


## Reference

    propertyKit.readwrite(value)
    propertyKit.readwrite(value, filter)
    propertyKit.readwrite(getter, setter)
    // Aliases: propertyKit

    propertyKit.readony(value)
    propertyKit.readony(getter)
    propertyKit.readony(value, key)
    propertyKit.readony(value, filter, key)
    propertyKit.readony(getter, setter, key)