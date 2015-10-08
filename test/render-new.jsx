// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var ChangeAtoB = React.createClass({
  componentWillReceiveProps: function(newProps) {
    if (newProps.value == 'a') newProps.onChange('b');
  },
  render: function() {
    return <span>{this.props.value}</span>
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
});
