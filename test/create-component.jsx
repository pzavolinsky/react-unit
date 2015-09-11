// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react/addons');

var WithNullChildren = React.createClass({
  render: function() {
    var nullChild;
    return <ul>
      <li>first child</li>
      {nullChild}
      <li>other child</li>
    </ul>
  }
});

describe('createComponent', () => {
  it('should work with null children', () => {
    var component = createComponent(<WithNullChildren/>);

    var lis = component.findByQuery('li');

    expect(lis.length).toEqual(2);
  });
});
