// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');
const R = require('ramda');

class ChangeAtoB extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.value == 'a') newProps.onChange('b');
  }
  render() {
    return <span>{this.props.value}</span>;
  }
}

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

describe('renderNew', () => {
  it('can be used to test componentWillReceiveProps', () => {
    let changedValue;

    // Refactor component description into a reusable function
    const newComponentDesc = props => {
      changedValue = undefined;
      return <ChangeAtoB onChange={cv => changedValue = cv} {...props} />
    }

    // Create component (componentWillReceiveProps will NOT be called)
    const component = createComponent(newComponentDesc({value: 'a'}));

    // Assert that the value didn't change
    expect(changedValue).toBeUndefined();

    // Now lets render a new version of the component changing the props...
    // NOTE: instead of calling createComponent(<desc>) we are using
    //       renderNew(<desc>), this method creates a copy of the EXISTNG
    //       component, updating its properties (componentWillReceiveProps).
    const newComponent = component.renderNew(newComponentDesc({value: 'a'}));

    // Assert that the value changed to be (i.e. in componentWillReceiveProps)
    expect(changedValue).toBe('b');
  });

  const setAndAssertValue = (comp, value) => {
    const input = comp.findByQuery('input')[0];

    input.onChange({target:{value: value}});

    const newComp = comp.renderNew();
    const newInput = newComp.findByQuery('input')[0];

    expect(newInput.props.value).toEqual(value);

    return newComp;
  }

  it('can be chained in deep mode', () => {
    const component = createComponent(<Stateful value="original" />);

    const data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });

  it('can be chained in interleaved mode', () => {
    const component = createComponent.interleaved(<Stateful value="original" />);

    const data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });

  it('can be chained in shallow mode', () => {
    const component = createComponent.shallow(<Stateful value="original" />);

    const data = ['a','b','c','d','e','f','g'];

    R.reduce(setAndAssertValue, component, data);
  });
});
