// Note: you should use const createComponent = require('react-unit');
const createComponent = require('./react-unit');
const React = require('react');

const Child = ({ title }) => <h1>{title}</h1>;
const Master = () => <div><Child title="First Child"/></div>;
const SuperMaster = () => <Master/>;

describe('findByComponent', () => {
    it('should find component', () => {
        const component = createComponent.shallow(<Master/>);

        const results = component.findByComponent(Child);

        expect(results.length).toEqual(1);
    });

    it('should find component in deeply nested components', () => {
        const component = createComponent.interleaved(<SuperMaster />);

        const results = component.findByComponent(Child);

        expect(results.length).toEqual(1);
    });

    it('should expose props from the Child component', () => {
        const component = createComponent.shallow(<Master/>);

        const results = component.findByComponent(Child);

        expect(results[0].prop('title')).toEqual('First Child');
    });

    it('should expose the props from the component', () => {
        const component = createComponent.interleaved(<SuperMaster />);

        const results = component.findByComponent(Child);

        expect(results[0].prop('title')).toEqual('First Child');
    });
});
