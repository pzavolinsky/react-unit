// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var Bouviers = React.createClass({
  render: function() {
    return <div name="Jacqueline Bouvier" ref="bouvier">
      <div name="Marge Bouvier" ref="bouvier">
        <div name="Lisa Simpson" ref="simpson" />
      </div>
      <input name="Patty Bouvier" ref="bouvier" />
    </div>
  }
});

describe('findBy', () => {
  it('can be used to find everything in depth order', () => {
    var component = createComponent(<Bouviers/>);

    // Find everything
    var everything = component.findBy(t => true);

    expect(everything.length).toEqual(4);
    expect(everything[0].props.name).toEqual('Jacqueline Bouvier');
    expect(everything[1].props.name).toEqual('Marge Bouvier');
    expect(everything[2].props.name).toEqual('Lisa Simpson');
    expect(everything[3].props.name).toEqual('Patty Bouvier');
  });

  it('can be used with a filter function', () => {
    var component = createComponent(<Bouviers/>);

    // Find Bouviers
    var isBouvier = t => t.props.name.indexOf('Bouvier') != -1;
    var bouviers = component.findBy(isBouvier);

    expect(bouviers.length).toEqual(3);
    expect(bouviers[0].props.name).toEqual('Jacqueline Bouvier');
    expect(bouviers[1].props.name).toEqual('Marge Bouvier');
    expect(bouviers[2].props.name).toEqual('Patty Bouvier');
  });
});

describe('findByRef', () => {
  it('should call the findBy method', () => {
    var component = createComponent(<Bouviers/>);
    spyOn(component, 'findBy');
    component.findByRef('myRef');

    expect(component.findBy).toHaveBeenCalled();
  });

  it('should find by ref attribute', () => {
    var component = createComponent(<Bouviers/>);
    var bouviers = component.findByRef('bouvier');
    var simpsons = component.findByRef('simpson');

    expect(bouviers.length).toEqual(3);
    expect(simpsons.length).toEqual(1);
    expect(simpsons[0].props.name).toEqual('Lisa Simpson');
  });
});
