// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const Bouviers = () =>
  <div name="Jacqueline Bouvier" ref="bouvier">
    <div name="Marge Bouvier" ref="bouvier">
      <div name="Lisa Simpson" ref="simpson" />
    </div>
    <input name="Patty Bouvier" ref="bouvier" />
  </div>;

describe('findByRef', () => {
  it('should call the findBy method', () => {
    const component = createComponent(<Bouviers/>);
    spyOn(component, 'findBy');
    component.findByRef('myRef');

    expect(component.findBy).toHaveBeenCalled();
  });

  it('should find by ref attribute', () => {
    const component = createComponent(<Bouviers/>);
    const bouviers = component.findByRef('bouvier');
    const simpsons = component.findByRef('simpson');

    expect(bouviers.length).toEqual(3);
    expect(simpsons.length).toEqual(1);
    expect(simpsons[0].props.name).toEqual('Lisa Simpson');
  });
});
