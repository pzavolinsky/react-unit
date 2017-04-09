// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

class ToUppercaseInput extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.onChange = this.onChange.bind(this);
  }
  onChange(e) {
    this.props.onChange({target:{
      value: e.target.value.toUpperCase()
    }});
  }
  render() {
    return <input
      onChange={this.onChange}
      value={this.props.value.toUpperCase()} />
  }
}
class OnlyUppercaseInput extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.onChange = this.onChange.bind(this);
  }
  onChange(e) {
    if (e.target.value != e.target.value.toUpperCase()) return;
    this.props.onChange({target:{ value: e.target.value }});
  }
  render() {
    return <input
      onChange={this.onChange}
      value={this.props.value.toUpperCase()} />
  }
}
class SimpleButton extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    // not using { target: { value: 'clicked' } } to show some variety
    this.props.onClick('clicked');
  }
  render() {
    return <button onClick={this.onClick}>Click me</button>
  }
}

describe('events', () => {
  it('should apply handler logic', () => {
    let changedValue; // to be updated by the component

    const component = createComponent(<ToUppercaseInput
      value="HELLO"
      onChange={e => changedValue = e.target.value}
    />);

    // Trigger the change event
    const input = component.findByQuery('input')[0];
    input.onChange({target: {value: 'HELLO, world'}});

    expect(changedValue).toEqual('HELLO, WORLD');
  });

  it('might be cancelled', () => {
    let changedValue; // to be updated by the component

    const component = createComponent(<OnlyUppercaseInput
      value="HELLO"
      onChange={e => changedValue = e.target.value}
    />);

    // Trigger the change event
    const input = component.findByQuery('input')[0];
    input.onChange({target: {value: 'HELLO, world'}});

    expect(changedValue).toBeUndefined();
  });

  it('can be called using shorthand methods (onClick and onChange)', () => {
    let message; // to be updated by the component

    const component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].onClick();

    expect(message).toBe('clicked');
  });

  it('can be called using on(event)', () => {
    let message; // to be updated by the component

    const component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].on('click');

    expect(message).toBe('clicked');
  });

  it('can be called directly using props', () => {
    let message; // to be updated by the component

    const component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].props.onClick();

    expect(message).toBe('clicked');
  });
});
