// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var TextsWithinSingleElement = React.createClass({
  render: function() {
    return <div>{"Hello"} {"world"}{"!"}</div>
  }
});

var TextsAccrossSeveralElements = React.createClass({
  render: function() {
    return <ul><li>1</li><li>2</li><li>3</li></ul>
  }
});

describe('text should be aggregated with no extra spaces added', () => {

  it('within a single element', () => {
    var component = createComponent(<TextsWithinSingleElement/>);
    var texts = component.findByQuery('div')[0];
    expect(texts.text).toEqual('Hello world!');
  });

  it('across several elements', () => {
    var component = createComponent(<TextsAccrossSeveralElements/>);
    var texts = component.findByQuery('ul')[0];
    expect(texts.text).toEqual('123');
  });

});
