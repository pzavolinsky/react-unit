// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const WithNullChildren = () =>
  <ul>
    <li>first child</li>
    {undefined}
    <li>other child</li>
  </ul>;

const WithChildren = ({ child }) => <div>{child}</div>;

const Person = ({ name,children }) =>
  <div>
      <h1>{name}</h1>
      <ul>{React.Children.map(children, (c,i) => <li key={i}>{c}</li>)}</ul>
  </div>;

const NullRender = () => null;

describe('createComponent', () => {
  it('renders recursively, erasing components', () => {
    const component = createComponent(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    const lisa = component.findByQuery('div > ul > li > div > h1')[1];

    expect(lisa.text).toEqual('Lisa');

    const persons = component.findByQuery('Person');

    expect(persons.length).toEqual(0);

  });

  it('should work with a component that renders nothing', () => {
    const component = createComponent(<NullRender/>);

    expect(component).toEqual(null);
  });

  it('should work with null children', () => {
    const component = createComponent(<WithNullChildren/>);

    const lis = component.findByQuery('li');

    expect(lis.length).toEqual(2);
  });

  it('should load numeric children', () => {
    const component = createComponent(<WithChildren child={1}/>);
    expect(component.text).toEqual('1');
  });

  it('should load text children', () => {
    const component = createComponent(<WithChildren child={'hey!'}/>);
    expect(component.text).toEqual('hey!');
  });
});
