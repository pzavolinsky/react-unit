react-unit
==========

React Unit is a lightweight unit test library for ReactJS with very few (js-only) dependencies.

By using `react-unit` you can run your ReactJS unit tests directly from node or gulp without having to install any heavyweight external dependencies (such as `jsdom`, `phantomjs`, the python runtime, etc.).

Note: for testing simple components you might also be interested in [react-cucumber](https://github.com/pzavolinsky/react-cucumber).

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

To find elements by their `ref` attribute, you can use the `findByRef` method:

```javascript
var allMyRefs = component.findByRef('myRef');
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

API Reference
-------------

#### Creating components

```javascript
// createComponent :: ReactElement -> Component
createComponent = (reactElement) => Component
```
Renders `reactElement` using the deep rendering strategy (see [Rendering Modes](#rendering-modes) for more details). Returns the rendered `Component`.

This method produces a component tree that is somewhat similar to applying `ReactDOM.render`.

For example:
```javascript
var createComponent = require('react-unit');
var component = createComponent(<MyComponent />);
```
More examples in [test/create-component.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/create-component.jsx).

---
<br>

```javascript
// createComponent.shallow :: ReactElement -> Component
createComponent.shallow = (reactElement) => Component
```
Renders `reactElement` using the shallow rendering strategy (see [Rendering Modes](#rendering-modes) for more details). Returns the rendered `Component`.

This method produces a shallow component tree. That is, it renders the root component and all the children HTML nodes, stopping at the first child component level.

For example:
```javascript
var createComponent = require('react-unit');
var component = createComponent.shallow(<MyComponent />);
```
More examples in [test/create-component-shallow.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/create-component-shallow.jsx).

---
<br>

```javascript
// createComponent.interleaved :: ReactElement -> Component
createComponent.interleaved = (reactElement) => Component
```
Renders `reactElement` using the interleaved rendering strategy (see [Rendering Modes](#rendering-modes) for more details). Returns the rendered `Component`.

This method produces a component tree that interleaves react components and actual rendered components.

For example:
```javascript
var createComponent = require('react-unit');
var component = createComponent.interleaved(<MyComponent />);
```
More examples in [test/create-component-interleaved.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/create-component-interleaved.jsx).

---
<br>

#### Finding components

```javascript
// findByQuery :: String -> [Component]
component.findByQuery => (sizzleExpression) => [Components]
```
Returns all the descendant elements of `component` matching `sizzleExpression`.

For example:
```javascript
var inputs = component.findByQuery('input');
```
More examples in [test/find-by-query.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-query.jsx).

---
<br>

```javascript
// findByComponent :: ReactElement -> [Component]
component.findByComponent => (reactElement) => [Components]
```
Returns all the descendant elements of `component` of type `reactElement`. Note that `findByComponent` only works with `shallow` and `interleaved` rendering modes. See [Rendering Modes](#rendering-modes) below for more details.

For example:
```javascript
// assuming: var MyItem = React.createClass({ ... });
var items = component.findByComponent(MyItem);
```
More examples in [test/find-by-component.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-component.jsx).

---
<br>

```javascript
// findBy :: (Component -> bool) -> [Component]
component.findBy => (fn) => [Components]
```
Returns all the descendant elements of `component` for whom `fn` returns `true`.

For example:
```javascript
var moreThanTwos = component.findBy(c => c.props.value > 2);
```
More examples in [test/find-by.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by.jsx).

---
<br>

```javascript
// findByRef :: String -> [Component]
component.findBy => (ref) => [Components]
```
Returns all the descendant elements of `component` matching the `ref` attribute.

For example:
```javascript
var allMyRefs = component.findByRef('myRef');
```
More examples in [test/find-by-ref.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-ref.jsx).

---
<br>

#### Inspecting components

```javascript
// dump :: () -> String
component.dump => () => String
```
Returns a string representation of the pseudo-HTML of the component. This method is very useful for troubleshooting broken tests.

For example:
```javascript
var html = component.dump();
// or
console.log(component.dump());
```

---
<br>

```javascript
component.texts // :: [String]
component.text  // :: String
```
Return the text of all the descendant elements of `component`. `texts` is a flat array containing the texts of every descendant element in depth order. `text` behaves like `DOMNode.textContent` (i.e. `component.texts.join('')`).

Some examples in [test/text.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/text.jsx).

---
<br>

```javascript
// key :: Object
component.props
```
The `props` object of `component`.

---
<br>

```javascript
// key :: String
component.key
```
The `key` of `component`.

---
<br>

```javascript
// ref :: String
component.ref
```
The `ref` of `component`.

---
<br>


Rendering Modes
---------------

#### Deep rendering (default behavior)

By default `react-unit` will use a deep (recursive) rendering strategy. This produces an output that is very similar to that of `ReactDOM.render`.

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

Excluding components
--------------------

Using `exclude` you can now leave a component out of test as if it didn't exist.

```jsx
//single component
createComponent.exclude(ChildComponent)(ParentComponent);
createComponent.exclude(ChildComponent).shallow(ParentComponent);
createComponent.exclude(ChildComponent).interleaved(ParentComponent);

//multi components
createComponent.exclude([ChildComponent1, ChildComponent2])(ParentComponent);
createComponent.exclude([ChildComponent1, ChildComponent2]).shallow(ParentComponent);
createComponent.exclude([ChildComponent1, ChildComponent2]).interleaved(ParentComponent);
```

Mocking components
------------------

Using `mock` you can now replace a component with another

```jsx
//single mock
createComponent.mock(Actual, Mock)(ParentComponent);

//multi mock
createComponent
  .mock(Actual1, Mock1)
  .mock(Actual2, Mock2)(ParentComponent);
```

Implicit context
----------------

If you want to test components that use React's implicit [context](https://facebook.github.io/react/docs/context.html) you can pass the context to the rendered components by calling `withContext`:

```jsx
createComponent.withContext({ key: value})(<MyComponentWithContext />);
```


More info
---------


Note that testing **stateful** components require additional effort. See [test/stateful.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/stateful.jsx) for more details.

For more examples on how to test **events** refer to [test/events.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/events.jsx).

For more examples on finding elements by **query selectors** refer to [test/find-by-query.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by-query.jsx).

For more examples on finding element using a **custom function** refer to [test/find-by.jsx](https://github.com/pzavolinsky/react-unit/blob/master/test/find-by.jsx).
