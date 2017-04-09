// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const SubItem = ({ children }) => <i>{children}</i>;
const Item = ({ children}) => <span>{children}</span>;
const Items = ({ children}) => <div>{children}</div>;

describe('exclude', () => {
  it('can "skip" a component using createComponent directly', () => {
    const component = createComponent.exclude(Item)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    const found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(0);
  });

  it('can reverts skip after run once', () => {

    const component = createComponent(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    const found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(1);
  });

  it('can "skip" a component using createComponent.shallow', () => {
    const component = createComponent
      .exclude(Item)
      .shallow(<Items><Item/></Items>);

    expect(component.findByComponent(Item).length).toEqual(0);
  });

  it('can "skip" a component using createComponent.interleaved', () => {
    const component = createComponent.exclude(Item).interleaved(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    const found = component.findByQuery('span:contains(1)');

    expect(found.length).toEqual(0);
  });

  it('does not affect nesting', () => {
    const component = createComponent(
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

    const found = component.findByQuery('i:contains("Hello World")');

    expect(found.length).toEqual(1);
  });

  it('can be nested and still exclude', () => {
    const component = createComponent.exclude(SubItem)(
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

    const found = component.findByQuery('i:contains("Hello World")');

    expect(found.length).toEqual(0);
  });

  it('can exclude multi', () => {
    const component = createComponent.exclude([Item, SubItem])(
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
    const component = createComponent.exclude(Item)(
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
