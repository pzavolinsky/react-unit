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

describe('with-context', () => {
  describe('when a component is given a context', () => {
    it('should receive it accordingly', () => {
      const component = createComponent
        .withContext({ text: 'hi!' })
        (<Echo />);

      expect(component.textContent).toEqual('hi!');
    });
  });
});
