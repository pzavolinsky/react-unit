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
