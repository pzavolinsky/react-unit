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

var Items = React.createClass({
  render: function() {
    return <div>{this.props.children}</div>
  }
});

describe('exclude', () => {
  it('can "skip" a component using createComponent directly', () => {
    var component = createComponent.exclude(Item)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(0);
  });

  it('can reverts skip after run once', () => {

    var component = createComponent(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(1);
  });

  it('can "skip" a component using createComponent.shallow', () => {
    var component = createComponent
      .exclude(Item)
      .shallow(<Items><Item/></Items>);

    expect(component.findByComponent(Item).length).toEqual(0);
  });

  it('can "skip" a component using createComponent.interleaved', () => {
    var component = createComponent.exclude(Item).interleaved(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(0);
  });

  it('does not affect nesting', () => {
    var component = createComponent(
      <Items>
        <Item>
          1
          <SubItem>Hello World</SubItem>
        </Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('i:contains("Hello World")');

    expect(found.length).toEqual(1);
  });

  it('can be nested and still exclude', () => {
    var component = createComponent.exclude(SubItem)(
      <Items>
        <Item>
          1
          <SubItem>Hello World</SubItem>
        </Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    var found = component.findByQuery('i:contains("Hello World")');

    expect(found.length).toEqual(0);
  });

  it('can exclude multi', () => {
    var component = createComponent.exclude([Item, SubItem])(
      <Items>
        <SubItem>Hello World</SubItem>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    expect(component.dump().replace(/[\n ]/g, '')).toEqual('<div/>');
  });

  it('dump is correct', () => {
    var component = createComponent.exclude(Item)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    expect(component.dump().replace(/[\n ]/g, '')).toEqual('<div/>');
  });
});
