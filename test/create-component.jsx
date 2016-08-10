// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var WithNullChildren = React.createClass({
  render: function() {
    var nullChild;
    return <ul>
      <li>first child</li>
      {nullChild}
      <li>other child</li>
    </ul>
  }
});

var WithChildren = React.createClass({
  render: function() { return <div>{this.props.child}</div> }
});

var Person = React.createClass({
  render: function() {
    var children = React.Children.map(this.props.children, (c,i) => <li key={i}>{c}</li>);
    return <div><h1>{this.props.name}</h1><ul>{children}</ul></div>
  }
});

var NullRender = React.createClass({
  render: function() { return null; }
});

describe('createComponent', () => {
  it('renders recursively, erasing components', () => {
    var component = createComponent(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    var lisa = component.findByQuery('div > ul > li > div > h1')[1];

    expect(lisa.text).toEqual('Lisa');

    var persons = component.findByQuery('Person');

    expect(persons.length).toEqual(0);

  });

  it('should work with a component that renders nothing', () => {
    var component = createComponent(<NullRender/>);

    expect(component).toEqual(null);
  });

  it('should work with null children', () => {
    var component = createComponent(<WithNullChildren/>);

    var lis = component.findByQuery('li');

    expect(lis.length).toEqual(2);
  });

  it('should load numeric children', () => {
    var component = createComponent(<WithChildren child={1}/>);
    expect(component.text).toEqual('1');
  });

  it('should load text children', () => {
    var component = createComponent(<WithChildren child={'hey!'}/>);
    expect(component.text).toEqual('hey!');
  });
});
