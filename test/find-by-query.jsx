// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const props = { value: 'found', onChange: function() {} }

const ByTag = () => <input {...props} />;
const ByClass = () => <input {...props} className="myClass" />;
const ByAttr = () => <input {...props} name="myName" />;
const ByRelativeClass = () =>
  <div>
    <div className="parent"><ByClass/></div>
    <input {...props} className="myClass" value="not in parent!" />
  </div>;
const ByTagAndAttr = () =>
  <div>
    <input {...props} name="myName" />
    <span name="myName" value="a span" />
  </div>;
const ByTagComposite = () => <ByTag/>;
const ByKey = () => <ul>{['a','b','c'].map(i => <li key={i}>{i}</li>)}</ul>;
const ByRef = () => <div><input {...props} ref="myRef" /></div>;
const ByContains = () =>
  <div><span>one</span><span>two</span><span>three</span></div>;

describe('findByQuery', () => {
  it('should find by tag name', () => {
    const component = createComponent(<ByTag/>);

    // Find every element with <input> tag
    const input = component.findByQuery('input')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by class name', () => {
    const component = createComponent(<ByClass/>);

    // Find every element with className="myClass"
    const input = component.findByQuery('.myClass')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by attribute', () => {
    const component = createComponent(<ByAttr/>);

    // Find every element with name="myName"
    const input = component.findByQuery('[name="myName"]')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by relative class name', () => {
    const component = createComponent(<ByRelativeClass/>);

    // Find every element with className="myClass" inside a parent with
    // className="parent"
    const inputs = component.findByQuery('.parent .myClass');

    expect(inputs.length).toEqual(1);
    expect(inputs[0].props.value).toEqual('found');
  });

  it('should find by class in nested trees returning depth order', () => {
    const component = createComponent(<ByRelativeClass/>);

    // Find every element with className="myClass"
    const inputs = component.findByQuery('.myClass');

    expect(inputs.length).toEqual(2);
    expect(inputs[0].props.value).toEqual('found');
    expect(inputs[1].props.value).toEqual('not in parent!');
  });

  it('should find by tag and attribute', () => {
    const component = createComponent(<ByTagAndAttr/>);

    // Find every <input> with name="myName"
    const inputs = component.findByQuery('input[name=myName]');

    expect(inputs.length).toEqual(1);
    expect(inputs[0].props.value).toEqual('found');
  });

  it('should find by tag name in a composite component', () => {
    const component = createComponent(<ByTagComposite/>);

    // Find every element with <input> tag
    const input = component.findByQuery('input')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by key', () => {
    const component = createComponent(<ByKey/>);

    // Find every element with key="c"
    const input = component.findByQuery('[key=c]')[0];

    expect(input.text).toEqual('c');
  });

  it('should find by ref', () => {
    const component = createComponent(<ByRef/>);

    // Find every element with ref="myRef"
    const input = component.findByQuery('[ref=myRef]')[0];

    expect(input.props.value).toEqual('found');
  });

  it('should find by contains', () => {
    const component = createComponent(<ByContains/>);

    // Find elements that contains
    const span = component.findByQuery('div span:contains("three")')[0];

    expect(span.textContent).toEqual('three');
  });
});
