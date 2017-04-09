// Note: you should use const createComponent = require('react-unit');
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

describe('createComponent.interleaved', () => {
  it('renders recursively, preserving components', () => {
    const component = createComponent.interleaved(
      <Person name="Homer">
        <Person name="Bart"/>
        <Person name="Lisa" />
        <Person name="Maggie" />
      </Person>);

    const lisaComp    = component.findByQuery('Person[name=Lisa]')[0];
    const lisaCompAlt = component.findByComponent(Person)[2];

    const lisaName    = component.findByQuery('Person[name=Lisa] h1')[0];
    const lisaNameAlt = lisaComp.findByQuery('h1')[0];

    expect(lisaComp.prop('name')).toEqual('Lisa');
    expect(lisaComp).toBe(lisaCompAlt);

    expect(lisaName.text).toEqual('Lisa');
    expect(lisaNameAlt).toBe(lisaName);
  });

  it('should find component in deeply nested components', () => {
    const component = createComponent.interleaved(<SuperMaster />);

    const results = component.findByQuery('Child');

    expect(results.length).toEqual(1);
  });

  it('should expose the props from the component', () => {
    const component = createComponent.interleaved(<SuperMaster />);

    const results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should render the actual components', () => {
    const component = createComponent.interleaved(<SuperMaster />);

    const results = component.findByQuery('Child')[0];

    expect(results.prop('title')).toEqual('First Child');
  });

  it('should render deep component trees', () => {
    const component = createComponent.interleaved(<MasterList titles={titles} />);

    const lis = component.findByQuery('li');
    const children = component.findByQuery('li > Child');
    const h1s = component.findByQuery('li > Child > h1');

    expect(lis.length).toEqual(titles.length);
    expect(children.length).toEqual(titles.length);
    expect(h1s.length).toEqual(titles.length);
  });
});
