// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');
var R = require('ramda');

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

var SetStateBeforeMount = React.createClass({
  getInitialState: function() {
    return {mounted: 'false'};
  },
  componentWillMount: function() {
    this.setState({mounted: 'true'});
  },
  render: function() {
    return <span className="status">{this.state.mounted}</span>
  }
});


describe('stateful controls', () => {
  it('should handle input changes', () => {
    var component = createComponent(<Stateful value="original" />);
    var input = component.findByQuery('input')[0];

    input.onChange({target:{value: 'new!'}});

    // Render the component with the new state into a new component:
    var newComponent = component.renderNew();
    var newInput = newComponent.findByQuery('input')[0];

    // Note that each time we render we get a new component with new
    // elements:
    expect(input).not.toBe(newInput);

    // And the original component remains unchanged:
    expect(input.props.value).toBe('original');

    // But the new component did change:
    expect(newInput.props.value).toEqual('new!');
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

  xit('can set state in their componentWillMount', () => {
    // Broken in 0.14 until https://github.com/facebook/react/issues/4461 is
    // fixed
    var component = createComponent(<SetStateBeforeMount />);

    expect(component.findByQuery('.status')[0].text).toEqual('true');
  });
});
