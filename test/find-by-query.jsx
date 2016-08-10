// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var props = { value: 'found', onChange: function() {} }

var ByTag = React.createClass({
  render: function() { return <input {...props} /> }
});
var ByClass = React.createClass({
  render: function() { return <input {...props} className="myClass" /> }
});
var ByAttr = React.createClass({
  render: function() { return <input {...props} name="myName" /> }
});
var ByRelativeClass = React.createClass({
  render: function() {
    return <div>
      <div className="parent"><ByClass/></div>
      <input {...props} className="myClass" value="not in parent!" />
    </div>
  }
});
var ByTagAndAttr = React.createClass({
  render: function() {
    return <div>
      <input {...props} name="myName" />
      <span name="myName" value="a span" />
    </div>
  }
});
var ByTagComposite = React.createClass({
  render: function() { return <ByTag/>; }
});
var ByKey = React.createClass({
  render: function() {
    var items = ['a','b','c'].map(i => <li key={i}>{i}</li>);
    return <ul>{items}</ul>;
  }
});
var ByRef = React.createClass({
  render: function() {
    return <div><input {...props} ref="myRef" /></div>;
  }
});
var ByContains = React.createClass({
  render: function() {
    return <div><span>one</span><span>two</span><span>three</span></div>;
  }
});

describe('findByQuery', () => {
  it('should find by tag name', () => {
    var component = createComponent(<ByTag/>);

    // Find every element with <input> tag
    var input = component.findByQuery('input')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by class name', () => {
    var component = createComponent(<ByClass/>);

    // Find every element with className="myClass"
    var input = component.findByQuery('.myClass')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by attribute', () => {
    var component = createComponent(<ByAttr/>);

    // Find every element with name="myName"
    var input = component.findByQuery('[name="myName"]')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by relative class name', () => {
    var component = createComponent(<ByRelativeClass/>);

    // Find every element with className="myClass" inside a parent with
    // className="parent"
    var inputs = component.findByQuery('.parent .myClass');

    expect(inputs.length).toEqual(1);
    expect(inputs[0].props.value).toEqual('found');
  });

  it('should find by class in nested trees returning depth order', () => {
    var component = createComponent(<ByRelativeClass/>);

    // Find every element with className="myClass"
    var inputs = component.findByQuery('.myClass');

    expect(inputs.length).toEqual(2);
    expect(inputs[0].props.value).toEqual('found');
    expect(inputs[1].props.value).toEqual('not in parent!');
  });

  it('should find by tag and attribute', () => {
    var component = createComponent(<ByTagAndAttr/>);

    // Find every <input> with name="myName"
    var inputs = component.findByQuery('input[name=myName]');

    expect(inputs.length).toEqual(1);
    expect(inputs[0].props.value).toEqual('found');
  });

  it('should find by tag name in a composite component', () => {
    var component = createComponent(<ByTagComposite/>);

    // Find every element with <input> tag
    var input = component.findByQuery('input')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by key', () => {
    var component = createComponent(<ByKey/>);

    // Find every element with key="c"
    var input = component.findByQuery('[key=c]')[0];

    expect(input.text).toEqual('c');
  });

  it('should find by ref', () => {
    var component = createComponent(<ByRef/>);

    // Find every element with ref="myRef"
    var input = component.findByQuery('[ref=myRef]')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by contains', () => {
    var component = createComponent(<ByContains/>);

    // Find elements that contains
    var span = component.findByQuery('div span:contains("three")')[0];

    expect(span.textContent).toEqual('three');
  });
});
