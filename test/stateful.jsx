// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

class Stateful extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = { value: this.props.value };
    this.onChange = this.onChange.bind(this);
  }
  onChange(e) {
    this.setState({value: e.target.value});
  }
  render() {
    return <input value={this.state.value} onChange={this.onChange} />;
  }
}
const StatefulWrapper = props => <div><Stateful {...props} /></div>;

class SetStateBeforeMount extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = {mounted: 'false'};
  }
  componentWillMount() {
    this.setState({mounted: 'true'});
  }
  render() {
    return <span className="status">{this.state.mounted}</span>
  }
}

describe('stateful controls', () => {
  it('should handle input changes', () => {
    const component = createComponent(<Stateful value="original" />);
    const input = component.findByQuery('input')[0];

    input.onChange({target:{value: 'new!'}});

    // Render the component with the new state into a new component:
    const newComponent = component.renderNew();
    const newInput = newComponent.findByQuery('input')[0];

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
    const component = createComponent.interleaved(
      <StatefulWrapper value="original" />
    );

    // You can uncomment the following line to se the result:
    // console.log(component.dump());

    // Emit the onChange event.
    const input = component.findByQuery('input')[0];
    input.onChange({target:{value: 'new!'}});

    // Find the Stateful component (this only works in interleaved and shallow
    // mode, you could also try findByQuery('input') in the default mode).
    const stateful = component.findByQuery('Stateful')[0];
    // or const stateful = component.findByComponent(Stateful)[0];
    // or const stateful = component.findByQuery('input')[0];

    // Note that we need to call renderNew on the Stateful component
    // and not on the root StatefulWrapper.
    const newStateful = stateful.renderNew();
    const newInput = newStateful.findByQuery('input')[0];

    expect(newInput.props.value).toEqual('new!');
  });

  it('can set state in their componentWillMount', () => {
    const component = createComponent(<SetStateBeforeMount />);

    expect(component.findByQuery('.status')[0].text).toEqual('true');
  });
});
