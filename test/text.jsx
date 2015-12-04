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

var WithButton = React.createClass({
  render: function() {
    return <span><button>Save</button></span>
  }
});

describe('text', () => {

  it('returns the component text', () => {
    var component = createComponent(<TextsWithinSingleElement/>);
    var div = component.findByQuery('div')[0];
    expect(div.text).toEqual('Hello world!');
  });

  it('returns the aggregated text of the children with no extra spaces', () => {
    var component = createComponent(<TextsAccrossSeveralElements/>);
    var uls = component.findByQuery('ul')[0];

    expect(uls.text).toEqual('123');

    // In some scenarios you might want to assert the individual text elements
    // in these cases you could also do:
    expect(uls.texts.join(' ')).toEqual('1 2 3');

    // or:
    expect(uls.texts).toEqual(['1', '2', '3']);
  });

  it('returns the text of children buttons', () => {
    var component = createComponent(<WithButton/>);
    var buttonWrapper = component.findByQuery('span')[0];
    var button = component.findByQuery('button')[0];

    expect(button.text).toEqual('Save');
    expect(buttonWrapper.text).toEqual('Save');
  });
});
