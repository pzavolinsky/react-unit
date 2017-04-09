// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const TextsWithinSingleElement = () => <div>{"Hello"} {"world"}{"!"}</div>;
const TextsAccrossSeveralElements = () =>
  <ul><li>1</li><li>2</li><li>3</li></ul>;
const WithButton = () => <span><button>Save</button></span>;

describe('text or textContent', () => {

  it('returns the component text', () => {
    const component = createComponent(<TextsWithinSingleElement/>);
    const div = component.findByQuery('div')[0];
    expect(div.text).toEqual('Hello world!');
    expect(div.textContent).toEqual('Hello world!');
  });

  it('returns the aggregated text of the children with no extra spaces', () => {
    const component = createComponent(<TextsAccrossSeveralElements/>);
    const uls = component.findByQuery('ul')[0];

    expect(uls.text).toEqual('123');
    expect(uls.textContent).toEqual('123');

    // In some scenarios you might want to assert the individual text elements
    // in these cases you could also do:
    expect(uls.texts.join(' ')).toEqual('1 2 3');

    // or:
    expect(uls.texts).toEqual(['1', '2', '3']);
  });

  it('returns the text of children buttons', () => {
    const component = createComponent(<WithButton/>);
    const buttonWrapper = component.findByQuery('span')[0];
    const button = component.findByQuery('button')[0];

    expect(button.text).toEqual('Save');
    expect(buttonWrapper.text).toEqual('Save');
  });
});
