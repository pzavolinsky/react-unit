const createComponent = require('./react-unit');
const React = require('react');
const R = require('ramda');

const Child = ({ title }) => <h1>{title}</h1>;
const Master = () => <div><Child title="First Child"/></div>;
const SuperMaster = () => <Master/>;
const MasterList = ({ titles }) =>
  <ul>
    {titles.map((t,i) => <li key={i}><Child title={t}/></li>)}
  </ul>;

const titles = [
  'Raiders of the Lost Ark',
  'Temple of Doom',
  'Last Crusade'
];

const Person = ({ name,children }) =>
  <div>
      <h1>{name}</h1>
      <ul>{React.Children.map(children, (c,i) => <li key={i}>{c}</li>)}</ul>
  </div>;

describe('createComponent.shallow', () => {
  it('renders a single level of depth, preserving components', () => {
    const component = createComponent.shallow(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    const lisaByAttr         = component.findByQuery('Person[name=Lisa]')[0];
    const lisaByTagAndOrder  = component.findByQuery('Person')[1];
    const lisaByCompAndOrder = component.findByComponent(Person)[1];

    expect(lisaByAttr.prop('name')).toEqual('Lisa');
    expect(lisaByTagAndOrder.prop('name')).toEqual('Lisa');
    expect(lisaByCompAndOrder.prop('name')).toEqual('Lisa');
  });

  it('should find direct descendent components', () => {
    const component = createComponent.shallow(<Master/>);

    const results = component.findByQuery('Child');

    expect(results.length).toEqual(1);
  });

  it('should expose props from direct descendent components', () => {
    const component = createComponent.shallow(<Master/>);

    const results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should not render child elements of direct descendent components', () => {
    const component = createComponent.shallow(<Master/>);

    const results = component.findByQuery('h1');

    expect(results.length).toEqual(0);
  });

  it('should render HTML between components', () => {
    const component = createComponent.shallow(<Master />);

    const child = component.findByQuery('div > Child')[0];

    expect(child).not.toBeUndefined();
  });

  it('should find component rendering just a string as children', () => {
    const Content = ({ children }) => <div>{children}</div>;
    const Page = () => <Content>Test</Content>;

    const component = createComponent.shallow(<Page/>);
    expect(component.findByComponent(Content).length).toEqual(1);
  });

  it('should find component passing the children down to child component', () => {
    const Content = ({ children }) => <div>{children}</div>;
    const Page = ({ children }) => <Content>{children}</Content>;

    const component = createComponent.shallow(<Page><div>Here</div></Page>);
    expect(component.findByComponent(Content).length).toEqual(1);
  });

  it('should allow findByQuery in component props', () => {
    const component = createComponent.shallow(<Master />);

    const child = component.findByQuery('Child[title="First Child"]')[0];

    expect(child).not.toBeUndefined();
  });

  it('should render lists of direct descendent components', () => {
    const component = createComponent.shallow(<MasterList titles={titles} />);

    const results = component.findByQuery('Child');

    expect(results.length).toEqual(titles.length);
    R.compose(
      R.forEach(([t,r]) => expect(r.prop('title')).toEqual(t)),
      R.zip(titles)
    )(results);
  });
});
