// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var Child = React.createClass({
  render: function() {
    return <span>{this.context && this.context.value || 'no-context'}</span>
  }
});

Child.contextTypes = {
  value: React.PropTypes.string
};

var Parent = React.createClass({
  render: function() {
    return (
      <div>
        <Child />
        <Child />
        <Child />
      </div>
    );
  }
});

describe('withContext', () => {
  it('can pass context through to all children components', () => {
    var component = createComponent.withContext({ value: 'context' })(<Parent />);

    expect(component.findByQuery('span:contains(context)').length).toEqual(3);
  });

  it('reverts withContext after run once', () => {

    var component = createComponent(<Parent />);

    expect(component.findByQuery('span:contains(no-context)').length).toEqual(3);
  });

  it('can pass context through to aall chilren components using createComponent.shallow', () => {
    var component = createComponent.withContext({ value: 'context' }).shallow(<Parent />);

    expect(component.findByQuery('span:contains(context)').length).toEqual(0);
    expect(component.findByQuery('span:contains(no-context)').length).toEqual(0);
  });

  it('can pass context through to aall chilren components using createComponent.interleaved', () => {
    var component = createComponent.withContext({ value: 'context' }).interleaved(<Parent />);

    expect(component.findByQuery('span:contains(context)').length).toEqual(3);
  });
});
