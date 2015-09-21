react-unit
==========

React Unit is a lightweight unit test library for ReactJS with very few (js-only) dependencies.

By using `react-unit` you can run your ReactJS unit tests directly from node or gulp without having to install any heavyweight external dependencies (such as `jsdom`, `phantomjs`, the python runtime, etc.).

Installation
------------

```
npm install --save-dev react-unit
```

and then, in your tests:
```javascript
var createComponent = require('react-unit');

describe('MyComponent', () => {
  it('should echo the value', () => {
    var component = createComponent(<MyComponent value="hello, world!" />);

    var input = component.findByQuery('input')[0];

    expect(input.props.value).toBe('hello, world!');
  });

  it('should trigger events', () => {
    var changedValue;
    function onChange(e) { changedValue = e.target.value; }

    var component = createComponent(<MyComponent onChange={onChange} />);
    var input = component.findByQuery('input')[0];

    input.onChange({target:{value: 'hi, everyone!'}});

    expect(changedValue).toBe('hi, everyone!');
  });
});
```

Note that, while this example is using Jasmine, `react-unit` should work with any other test language of your choice.


Usage
-----

To use `react-unit` just require the `createComponent` function:

```javascript
var createComponent = require('react-unit');
```

Then use it to create your component:

```javascript
var component = createComponent(<MyComponent value="hello, world!" />);
```

or (if, for some reason you are not into JSX):

```javascript
var component = createComponent(React.createElement(MyComponent, { value: "hello, world!" }));
```

Now that you have a representation of your component you can use it to find actual HTML elements calling `findByQuery`:

```javascript
var allInputs     = component.findByQuery('input');
var allRows       = component.findByQuery('.row');
var allFirstNames = component.findByQuery('[name=firstName]');
```

By now you probably noted that `findByQuery` takes something suspiciously similar to jQuery selectors. This is not an innocent coincidence, `react-unit` is bundled with the amazing [jQuery Sizzle](https://github.com/jquery/sizzle) to allow you to search your react DOM using query selectors.

In addition to `findByQuery` you can use `findBy` to test every element using a custom function:

```javascript
var all = component.findBy(function() { return true; }); // () => true
var moreThanTwo = component.findBy(function(c) { return c.props.value > 2 });
```

If you want to test event handling, you can bind a handler to your component:

```javascript
var changeEvent;
function handler(e) { changeEvent = e; }
var component = createComponent(<MyComponent onChange={handler} />);
```

Then find and interact with any element in the component:

```javascript
component.findByQuery('some selector')[0].onChange('some event');
```

Finally assert the event:

```javascript
expect(changeEvent).toBe('some event');
```

If you want to test if the component is rendering the right sub-components in right amount. You can use `findByComponent`
method to find them.

```javascript
var list = component.findByComponent(MyComponent);
expect(list.length).toEqual(2);

```

Note that testing **stateful** components require additional effort. See [test/stateful.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/stateful.jsx) for more details.

For more examples on how to test **events** refer to [test/events.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/events.jsx).

For more examples on finding elements by **query selectors** refer to [test/find-by-query.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-query.jsx).

For more examples on finding element using a **custom function** refer to [test/find-by.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by.jsx).
