// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var Bouviers = React.createClass({
  render: function() {
    return <div name="Jacqueline Bouvier">
      <div name="Marge Bouvier">
        <div name="Lisa Simpson" />
      </div>
      <input name="Patty Bouvier" />
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
