// Note: you should use var createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const FancyInput = ({ value, onChange }) =>
  <input className="fancy" value={value} onChange={onChange} />;

const FancyBorder = ({ children }) =>
  <div className="fancy-border">{ children }</div>;

describe('stateless components', () => {
  it('can be queried for child elements', () => {
    // Render the stateless component
    const component = createComponent(<FancyInput value="hi!" />);

    // Find components on the rendered results
    const input = component.findByQuery('input')[0];

    // Assert props
    expect(input.props.value).toBe("hi!");
    expect(input.props.className).toBe("fancy");
  });

  it('can be queried for child components', () => {
    // Render the stateless component
    const component = createComponent(
      <FancyBorder>
        <FancyInput value="hi!" />
      </FancyBorder>
    );

    // Find components on the rendered results
    const border = component.findByQuery('div.fancy-border')[0];

    // Note that we search components in directly in `border`
    const input = border.findByQuery('input')[0];

    // Assert props
    expect(border).not.toBeUndefined();
  });

  it('can handle events', () => {
    // Here we'll store the change event
    let event;

    // Render the stateless component (note the onChange handler)
    const component = createComponent(
      <FancyInput value="original" onChange={e => event = e}/>
    );

    // Find components on the rendered results
    const input = component.findByQuery('input')[0];

    // Trigger the change event (e.g. simulating a user typing something)
    const e = {target:{value: 'new!'}};
    input.onChange(e);

    // Assert the changed event
    expect(event).toBe(e);
  });
});
