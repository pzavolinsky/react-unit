// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var ToUppercaseInput = React.createClass({
  onChange: function(e) {
    this.props.onChange({target:{
      value: e.target.value.toUpperCase()
    }});
  },
  render: function() {
    return <input
      onChange={this.onChange}
      value={this.props.value.toUpperCase()} />
  }
});
var OnlyUppercaseInput = React.createClass({
  onChange: function(e) {
    if (e.target.value != e.target.value.toUpperCase()) return;
    this.props.onChange({target:{ value: e.target.value }});
  },
  render: function() {
    return <input
      onChange={this.onChange}
      value={this.props.value.toUpperCase()} />
  }
});
var SimpleButton = React.createClass({
  onClick: function(e) {
    // not using { target: { value: 'clicked' } } to show some variety
    this.props.onClick('clicked');
  },
  render: function() {
    return <button onClick={this.onClick}>Click me</button>
  }
});

describe('events', () => {
  it('should apply handler logic', () => {
    var changedValue; // to be updated by the component

    var component = createComponent(<ToUppercaseInput
      value="HELLO"
      onChange={e => changedValue = e.target.value}
    />);

    // Trigger the change event
    var input = component.findByQuery('input')[0];
    input.onChange({target: {value: 'HELLO, world'}});

    expect(changedValue).toEqual('HELLO, WORLD');
  });

  it('might be cancelled', () => {
    var changedValue; // to be updated by the component

    var component = createComponent(<OnlyUppercaseInput
      value="HELLO"
      onChange={e => changedValue = e.target.value}
    />);

    // Trigger the change event
    var input = component.findByQuery('input')[0];
    input.onChange({target: {value: 'HELLO, world'}});

    expect(changedValue).toBeUndefined();
  });

  it('can be called using shorthand methods (onClick and onChange)', () => {
    var message; // to be updated by the component

    var component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].onClick();

    expect(message).toBe('clicked');
  });

  it('can be called using on(event)', () => {
    var message; // to be updated by the component

    var component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].on('click');

    expect(message).toBe('clicked');
  });

  it('can be called directly using props', () => {
    var message; // to be updated by the component

    var component = createComponent(<SimpleButton onClick={e => message = e}/>);

    // Trigger the click event
    component.findByQuery('button')[0].props.onClick();

    expect(message).toBe('clicked');
  });
});
