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
var React = require('react');
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

If you want to find a component using a component variable instead of a string expression, you can use `findByComponent`:

```javascript
var component = createComponent.shallow(<CompositeComponent />); // Note: the .shallow!
// or var component = createComponent.interleaved(<CompositeComponent />);

var children = component.findByComponent(ChildComponent);
```
Note that `findByComponent` only works with `shallow` and `interleaved` rendering modes. See [Rendering Modes](#rendering-modes) below for more details.

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

If at any point you want to inspect the rendered component you can use:

```javascript
console.log(component.dump());
```


Rendering Modes
---------------

#### Deep rendering (default behavior)

By default `react-unit` will use a deep (recursive) rendering strategy. This produces an output that is very similar to that of `React.render`.

For example, given:

```jsx
var Person = React.createClass({
  render: function() {
    var children = React.Children.map(this.props.children, (c,i) => <li key={i}>{c}</li>);
    return <div><h1>{this.props.name}</h1><ul>{children}</ul></div>
  }
});
```

Calling `createComponent` in a composite component:

```jsx
var component = createComponent(
  <Person name="Homer">
    <Person name="Bart"/>
    <Person name="Lisa" />
    <Person name="Maggie" />
  </Person>);
```

Results in a representation of the following HTML:

```html
<div>
  <h1>Homer</h1>
  <ul>
    <li>
      <div><h1>Bart</h1><ul></ul></div>
    </li>
    <li>
      <div><h1>Lisa</h1><ul></ul></div>
    </li>
    <li>
      <div><h1>Maggie</h1><ul></ul></div>
    </li>
  </ul>
</div>
```

In other words, the output is the HTML that results of calling the render method of every component. Note that, as a side-effect of deep rendering, component tags (e.g. `<Person/>`) were erased from the HTML representation.

In the example above you find `Lisa` with:

```jsx
var lisa = component.findByQuery('div > ul > li > div > h1')[1];
```

On the flip side, you cannot use `findByQuery` to find your components because, after rendering, they were replaced by the HTML they generate in their `render` method:

```jsx
var persons = component.findByQuery('Person');
expect(persons.length).toEqual(0);
```

#### Shallow rendering

Sometimes you might want to stop rendering after the first level of components. In true unit test spirit you would like to just test a component assuming the components it depends upon are working.

To achieve this you can use `createComponent.shallow` as follows:

```jsx
var component = createComponent.shallow(
  <Person name="Homer">
    <Person name="Bart"/>
    <Person name="Lisa" />
    <Person name="Maggie" />
  </Person>);
```

And the result would be a representation of the following pseudo-HTML:

```html
<div>
  <h1>Homer</h1>
  <ul>
    <li>
      <Person name="Bart"/>
    </li>
    <li>
      <Person name="Lisa"/>
    </li>
    <li>
      <Person name="Maggie"/>
    </li>
  </ul>
</div>
```

To find `Lisa` you could use any of the following:

```jsx
var lisaByAttr         = component.findByQuery('Person[name=Lisa]')[0];
var lisaByTagAndOrder  = component.findByQuery('Person')[1];
var lisaByCompAndOrder = component.findByComponent(Person)[1];
```

And access the properties as usual:

```jsx
expect(lisaByAttr.prop('name')).toEqual('Lisa');
```

#### Interleaved rendering

This rendering mode is similar to the deep mode above with the exception that components are NOT erased form the HTML representation. This means that you can mix and match HTML tags and react components in your `findByQuery` selectors.

To use interleaved rendering call `createComponent.interleaved` as follows:

```jsx
var component = createComponent.interleaved(
  <Person name="Homer">
    <Person name="Bart"/>
    <Person name="Lisa" />
    <Person name="Maggie" />
  </Person>);
```

The result would be a representation of the following pseudo-HTML:

```html
<Person name="Homer">
  <div>
    <h1>Homer</h1>
    <ul>
      <li>
        <Person name="Bart">
          <div><h1>Bart</h1><ul></ul></div>
        </Person>
      </li>
      <li>
        <Person name="Lisa">
          <div><h1>Lisa</h1><ul></ul></div>
        </Person>
      </li>
      <li>
        <Person name="Maggie">
          <div><h1>Maggie</h1><ul></ul></div>
        </Person>
      </li>
    </ul>
  </div>
</Person>
```

And you can find components with:

```jsx
var lisaComp    = component.findByQuery('Person[name=Lisa]')[0];
var lisaCompAlt = component.findByComponent(Person)[2];

var lisaName    = component.findByQuery('Person[name=Lisa] h1')[0];
var lisaNameAlt = lisaComp.findByQuery('h1')[0];
```

More info
---------


Note that testing **stateful** components require additional effort. See [test/stateful.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/stateful.jsx) for more details.

For more examples on how to test **events** refer to [test/events.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/events.jsx).

For more examples on finding elements by **query selectors** refer to [test/find-by-query.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-query.jsx).

For more examples on finding element using a **custom function** refer to [test/find-by.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by.jsx).
