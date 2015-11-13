// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');
var R = require('ramda');

var ChangeAtoB = React.createClass({
  componentWillReceiveProps: function(newProps) {
    if (newProps.value == 'a') newProps.onChange('b');
  },
  render: function() {
    return <span>{this.props.value}</span>
  }
});

var Stateful = React.createClass({
  getInitialState: function() {
    return { value: this.props.value };
  },
  onChange: function(e) {
    this.setState({value: e.target.value});
  },
  render: function() {
    return <input value={this.state.value} onChange={this.onChange} />
  }
});

describe('renderNew', () => {
  it('can be used to test componentWillReceiveProps', () => {
    var changedValue;

    // Refactor component description into a reusable function
    var newComponentDesc = props => {
      changedValue = undefined;
      return <ChangeAtoB onChange={cv => changedValue = cv} {...props} />
    }

    // Create component (componentWillReceiveProps will NOT be called)
    var component = createComponent(newComponentDesc({value: 'a'}));

    // Assert that the value didn't change
    expect(changedValue).toBeUndefined();

    // Now lets render a new version of the component changing the props...
    // NOTE: instead of calling createComponent(<desc>) we are using
    //       renderNew(<desc>), this method creates a copy of the EXISTNG
    //       component, updating its properties (componentWillReceiveProps).
    var newComponent = component.renderNew(newComponentDesc({value: 'a'}));

    // Assert that the value changed to be (i.e. in componentWillReceiveProps)
    expect(changedValue).toBe('b');
  });

  var setAndAssertValue = (comp, value) => {
    var input = comp.findByQuery('input')[0];

    input.onChange({target:{value: value}});

    var newComp = comp.renderNew();
    var newInput = newComp.findByQuery('input')[0];

    expect(newInput.props.value).toEqual(value);

    return newComp;
  }

  it('can be chained in deep mode', () => {
    var component = createComponent(<Stateful value="original" />);

    var data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });

  it('can be chained in interleaved mode', () => {
    var component = createComponent.interleaved(<Stateful value="original" />);

    var data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });

  it('can be chained in shallow mode', () => {
    var component = createComponent.shallow(<Stateful value="original" />);

    var data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });
});
