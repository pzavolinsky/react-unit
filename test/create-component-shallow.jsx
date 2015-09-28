// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react/addons');
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

describe('createComponent.shallow', () => {
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
