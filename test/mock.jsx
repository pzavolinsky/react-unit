// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var SubItem = React.createClass({
  render: function() {
    return <i>{this.props.children}</i>
  }
});

var Item = React.createClass({
  render: function() {
    return <span>{this.props.children}</span>
  }
});

var It = React.createClass({
  render: function() {
    return <span>{this.props.children}</span>
  }
});

var Items = React.createClass({
  render: function() {
    return <div>{this.props.children}</div>
  }
});

var Blink = React.createClass({
  render: function() {
    return <blink>{this.props.children}</blink>
  }
});

var Cite = React.createClass({
  render: function() {
    return <cite>{this.props.children}</cite>
  }
});

class Original extends React.Component {
  render() {
    return <span>I'm the original</span>;
  }
}
class Mock extends React.Component {
  render() {
    return <span>I'm the mock</span>;
  }
}
class Parent extends React.Component {
  render() {
    return <Original />;
  }
}

describe('mock', () => {
  it('can mock components', () => {
    var component = createComponent.mock(Item, Blink)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('blink');
    var found1 = component.findByQuery('blink:contains(4)');

    expect(found.length).toEqual(4);
    expect(found1.length).toEqual(1);
    expect(found1[0].dump().replace(/[\n ]/g, '')).toEqual('<blink>4</blink>');
  });

  it('can mock a parent component', () => {
    var component = createComponent.mock(Items, Blink)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('blink');

    expect(found.length).toEqual(1);
    expect(found[0].dump().replace(/[\n ]/g, '')).toEqual(
      '<blink><span>1</span><span>2</span><span>3</span><span>4</span></blink>'
    );
  });

  it('can mock components repeatedly', () => {
    var component = createComponent
      .mock(Item, Blink)
      .mock(It, Cite)(
        <Items>
          <Item>1</Item>
          <Item>2</Item>
          <It>3</It>
          <It>4</It>
        </Items>
      );

    var found = component.findByQuery('div');
    var foundBlinks = component.findByQuery('blink');
    var foundCites = component.findByQuery('cite');

    expect(found.length).toEqual(1);
    expect(foundBlinks.length).toEqual(2);
    expect(foundCites.length).toEqual(2);

    expect(found[0].dump().replace(/[\n ]/g,
       '<div><blink>1</blink><blink>2</blink><cite>3</cite><cite>4</cite></div>'
     ));
  });

  it('can be combined with exclude', () => {
    var component = createComponent
      .mock(Item, Blink)
      .exclude(Cite)(
        <Items>
          <Cite>Hey</Cite>
          <Item>1</Item>
          <Item>2</Item>
        </Items>
      );

    var foundBlinks = component.findByQuery('blink');
    var foundCites = component.findByQuery('cite');

    expect(foundBlinks.length).toEqual(2);
    expect(foundCites.length).toEqual(0);

    expect(component.dump().replace(/[\n ]/g,
      '<div><blink>1</blink><blink>2</blink></div>'
    ));
  });

  xit('understands findByComponent', () => {
    const component = createComponent
      .mock(Original, Mock)
      (<Parent />);
    expect(component.findByComponent(Original).length).toBe(0);
    expect(component.findByComponent(Mock).length).toBe(1);
  })
});
