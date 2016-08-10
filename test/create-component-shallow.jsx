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

describe('createComponent.shallow', () => {
  it('renders a single level of depth, preserving components', () => {
    var component = createComponent.shallow(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    var lisaByAttr         = component.findByQuery('Person[name=Lisa]')[0];
    var lisaByTagAndOrder  = component.findByQuery('Person')[1];
    var lisaByCompAndOrder = component.findByComponent(Person)[1];

    expect(lisaByAttr.prop('name')).toEqual('Lisa');
    expect(lisaByTagAndOrder.prop('name')).toEqual('Lisa');
    expect(lisaByCompAndOrder.prop('name')).toEqual('Lisa');
  });

  it('should find direct descendent components', () => {
    var component = createComponent.shallow(<Master/>);

    var results = component.findByQuery('Child');

    expect(results.length).toEqual(1);
  });

  it('should expose props from direct descendent components', () => {
    var component = createComponent.shallow(<Master/>);

    var results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should not render child elements of direct descendent components', () => {
    var component = createComponent.shallow(<Master/>);

    var results = component.findByQuery('h1');

    expect(results.length).toEqual(0);
  });

  it('should render HTML between components', () => {
    var component = createComponent.shallow(<Master />);

    var child = component.findByQuery('div > Child')[0];

    expect(child).not.toBeUndefined();
  });

  it('should find component rendering just a string as children', () => {
    var Content = React.createClass({
      render: function() { return <div>{this.props.children}</div> }
    });

    var Page = React.createClass({
      render: function() { return (
          <Content>Test</Content>
      )}
    });

    var component = createComponent.shallow(<Page/>);
    expect(component.findByComponent(Content).length).toEqual(1);
  });

  it('should find component passing the children down to child component', () => {
    var Content = React.createClass({
      render: function() { return <div>{this.props.children}</div> }
    });

    var Page = React.createClass({
      render: function() { return (
          <Content>{this.props.children}</Content>
      )}
    });

    var component = createComponent.shallow(<Page><div>Here</div></Page>);
    expect(component.findByComponent(Content).length).toEqual(1);
  });

  it('should allow findByQuery in component props', () => {
    var component = createComponent.shallow(<Master />);

    var child = component.findByQuery('Child[title="First Child"]')[0];

    expect(child).not.toBeUndefined();
  });

  it('should render lists of direct descendent components', () => {
    var component = createComponent.shallow(<MasterList titles={titles} />);

    var results = component.findByQuery('Child');

    expect(results.length).toEqual(titles.length);
    R.compose(
      R.forEach(([t,r]) => expect(r.prop('title')).toEqual(t)),
      R.zip(titles)
    )(results);
  });
});
