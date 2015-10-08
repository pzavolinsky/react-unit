// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');
var R = require('ramda');

var Child = React.createClass({
  render: function() { return <h1>{this.props.title}</h1> }
});

var Master = React.createClass({
  render: function() { return <div><Child title="First Child"/></div> }
});

var SuperMaster = React.createClass({
  render: function() { return <Master/> }
});

var MasterList = React.createClass({
  render: function() {
    var children = this.props.titles.map((t,i) => <li key={i}>
      <Child title={t}/>
    </li>);
    return <ul>{children}</ul>
  }
});

var titles = [
  'Raiders of the Lost Ark',
  'Temple of Doom',
  'Last Crusade'
];

var Person = React.createClass({
  render: function() {
    var children = React.Children.map(this.props.children, (c,i) => <li key={i}>{c}</li>);
    return <div><h1>{this.props.name}</h1><ul>{children}</ul></div>
  }
});

describe('createComponent.interleaved', () => {
  it('renders recursively, preserving components', () => {
    var component = createComponent.interleaved(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    var lisaComp    = component.findByQuery('Person[name=Lisa]')[0];
    var lisaCompAlt = component.findByComponent(Person)[2];

    var lisaName    = component.findByQuery('Person[name=Lisa] h1')[0];
    var lisaNameAlt = lisaComp.findByQuery('h1')[0];

    expect(lisaComp.prop('name')).toEqual('Lisa');
    expect(lisaComp).toBe(lisaCompAlt);

    expect(lisaName.text).toEqual('Lisa');
    expect(lisaNameAlt).toBe(lisaName);
  });

  it('should find component in deeply nested components', () => {
    var component = createComponent.interleaved(<SuperMaster />);

    var results = component.findByQuery('Child');

    expect(results.length).toEqual(1);
  });

  it('should expose the props from the component', () => {
    var component = createComponent.interleaved(<SuperMaster />);

    var results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should render the actual components', () => {
    var component = createComponent.interleaved(<SuperMaster />);

    var results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should render deep component trees', () => {
    var component = createComponent.interleaved(<MasterList titles={titles} />);

    var lis = component.findByQuery('li');
    var children = component.findByQuery('li > Child');
    var h1s = component.findByQuery('li > Child > h1');

    expect(lis.length).toEqual(titles.length);
    expect(children.length).toEqual(titles.length);
    expect(h1s.length).toEqual(titles.length);
  });
});
