// Note: you should use: import createComponent from 'react-unit';
import createComponent from './react-unit';
import * as React from 'react';

class Echo extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
  }
  render() {
    return <span>{this.context.text}</span>
  }
}
Echo.contextTypes = {
  text: React.PropTypes.string
}

const Child = React.createClass({
  render: function() {
    return <span>{this.context && this.context.value || 'no-context'}</span>;
  }
});

Child.contextTypes = {
  value: React.PropTypes.string
};

const Parent = () =>
  <div>
    <Child />
    <Child />
    <Child />
  </div>;

describe('withContext', () => {
  it('passes the context to the rendered component', () => {
    const component = createComponent
      .withContext({ text: 'hi!' })
      (<Echo />);

    expect(component.textContent)
    .toEqual('hi!');
  });

  it('passes the context to the children', () => {
    const component = createComponent
      .withContext({ value: 'context' })
      (<Parent />);

    expect(component.findByQuery('span:contains(context)').length)
    .toEqual(3);
  });

  it('does not leak the context across calls', () => {
    createComponent.withContext({ value: 'context' })(<Parent />);
    const component = createComponent(<Parent />);
    expect(component.findByQuery('span:contains(no-context)').length)
    .toEqual(3);
  });

  it('passes the context to the children when using shallow render', () => {
    const component = createComponent
      .withContext({ value: 'context' })
      .shallow(<Parent />);

    expect(component.findByQuery('span:contains(context)').length)
    .toEqual(0);
    expect(component.findByQuery('span:contains(no-context)').length)
    .toEqual(0);
  });

  it('passes the context to the children when using interleaved render', () => {
    const component = createComponent
      .withContext({ value: 'context' })
      .interleaved(<Parent />);

    expect(component.findByQuery('span:contains(context)').length)
    .toEqual(3);
  });
});
