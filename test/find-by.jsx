// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const Bouviers = () =>
  <div name="Jacqueline Bouvier">
    <div name="Marge Bouvier">
      <div name="Lisa Simpson" />
    </div>
    <input name="Patty Bouvier" />
  </div>;

describe('findBy', () => {
  it('can be used to find everything in depth order', () => {
    const component = createComponent(<Bouviers/>);

    // Find everything
    const everything = component.findBy(t => true);

    expect(everything.length).toEqual(4);
    expect(everything[0].props.name).toEqual('Jacqueline Bouvier');
    expect(everything[1].props.name).toEqual('Marge Bouvier');
    expect(everything[2].props.name).toEqual('Lisa Simpson');
    expect(everything[3].props.name).toEqual('Patty Bouvier');
  });

  it('can be used with a filter function', () => {
    const component = createComponent(<Bouviers/>);

    // Find Bouviers
    const isBouvier = t => t.props.name.indexOf('Bouvier') != -1;
    const bouviers = component.findBy(isBouvier);

    expect(bouviers.length).toEqual(3);
    expect(bouviers[0].props.name).toEqual('Jacqueline Bouvier');
    expect(bouviers[1].props.name).toEqual('Marge Bouvier');
    expect(bouviers[2].props.name).toEqual('Patty Bouvier');
  });
});
