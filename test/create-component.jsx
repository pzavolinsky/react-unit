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

var WithChildren = React.createClass({
  render: function() { return <div>{this.props.child}</div> }
});

describe('createComponent', () => {
  it('should work with null children', () => {
    var component = createComponent(<WithNullChildren/>);

    var lis = component.findByQuery('li');

    expect(lis.length).toEqual(2);
  });

  it('should load numeric children', () => {
    var component = createComponent(<WithChildren child={1}/>);
    expect(component.text).toEqual('1');
  });

  it('should load text children', () => {
    var component = createComponent(<WithChildren child={'hey!'}/>);
    expect(component.text).toEqual('hey!');
  });
});
