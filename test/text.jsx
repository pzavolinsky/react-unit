// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var WithTexts = React.createClass({
  render: function() {
    return <div>{"Hello"} {"world"}{"!"}</div>
  }
});

describe('text', () => {

  it('renders text by concatenating texts', () => {
    var component = createComponent(<WithTexts/>);

    var texts = component.findByQuery('div')[0];

    expect(texts.text).toEqual('Hello world!');
  });

});
