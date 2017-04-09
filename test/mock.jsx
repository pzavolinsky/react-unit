// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const SubItem = ({ children}) => <i>{children}</i>;
const Item = ({ children}) => <span>{children}</span>;
const It = ({ children}) => <span>{children}</span>;
const Items = ({ children}) => <div>{children}</div>;
const Blink = ({ children}) => <blink>{children}</blink>;
const Cite = ({ children}) => <cite>{children}</cite>;
const Original = () => <span>I'm the original</span>;
const Mock = () => <span>I'm the mock</span>;
const Parent = () => <Original />;

describe('mock', () => {
  it('can mock components', () => {
    const component = createComponent.mock(Item, Blink)(
      <Items>
        <Item>1</Item>
        <Item>2</Item>
        <Item>3</Item>
        <Item>4</Item>
      </Items>
    );

    const found = component.findByQuery('blink');
    const found1 = component.findByQuery('blink:contains(4)');

    expect(found.length).toEqual(4);
    expect(found1.length).toEqual(1);
    expect(found1[0].dump().replace(/[\n ]/g, '')).toEqual('<blink>4</blink>');
  });

  it('can mock components repeatedly', () => {
    const component = createComponent
      .mock(Item, Blink)
      .mock(It, Cite)(
        <Items>
          <Item>1</Item>
          <Item>2</Item>
          <It>3</It>
          <It>4</It>
        </Items>
      );

    const found = component.findByQuery('div');
    const foundBlinks = component.findByQuery('blink');
    const foundCites = component.findByQuery('cite');

    expect(found.length).toEqual(1);
    expect(foundBlinks.length).toEqual(2);
    expect(foundCites.length).toEqual(2);

    expect(found[0].dump().replace(/[\n ]/g,
       '<div><blink>1</blink><blink>2</blink><cite>3</cite><cite>4</cite></div>'
     ));
  });

  it('can be combined with exclude', () => {
    const component = createComponent
      .mock(Item, Blink)
      .exclude(Cite)(
        <Items>
          <Cite>Hey</Cite>
          <Item>1</Item>
          <Item>2</Item>
        </Items>
      );

    const foundBlinks = component.findByQuery('blink');
    const foundCites = component.findByQuery('cite');

    expect(foundBlinks.length).toEqual(2);
    expect(foundCites.length).toEqual(0);

    expect(component.dump().replace(/[\n ]/g,
      '<div><blink>1</blink><blink>2</blink></div>'
    ));
  });

  it('understands findByComponent', () => {
    const component = createComponent
      .mock(Original, Mock)
      .interleaved
      (<Parent />);

    expect(component.findByComponent(Original).length).toBe(0);
    expect(component.findByComponent(Mock).length).toBe(1);
  })
});
