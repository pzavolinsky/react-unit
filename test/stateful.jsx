// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

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

var StatefulWrapper = React.createClass({
  render: function() {
    return <div><Stateful {...this.props} /></div>;
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

  it('should handle input changes in nested components', () => {

    // We will create the component in interleaved mode so that we can access
    // the <Stateful> child component.
    var component = createComponent.interleaved(
      <StatefulWrapper value="original" />
    );

    // You can uncomment the following line to se the result:
    // console.log(component.dump());

    // Emit the onChange event.
    var input = component.findByQuery('input')[0];
    input.onChange({target:{value: 'new!'}});

    // Find the Stateful component (this only works in interleaved and shallow
    // mode, you could also try findByQuery('input') in the default mode).
    var stateful = component.findByQuery('Stateful')[0];
    // or var stateful = component.findByComponent(Stateful)[0];
    // or var stateful = component.findByQuery('input')[0];

    // Note that we need to call renderNew on the Stateful component
    // and not on the root StatefulWrapper.
    var newStateful = stateful.renderNew();
    var newInput = newStateful.findByQuery('input')[0];

    expect(newInput.props.value).toEqual('new!');
  });

  it('can set state in their componentWillMount', () => {
    var component = createComponent(<SetStateBeforeMount />);

    expect(component.findByQuery('.status')[0].text).toEqual('true');
  });
});
