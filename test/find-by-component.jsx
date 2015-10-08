// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var Child = React.createClass({
    render: function() { return <h1>{this.props.title}</h1> }
});

var Master = React.createClass({
    render: function() { return <div><Child title="First Child"/></div> }
});

var SuperMaster = React.createClass({
    render: function() { return <Master/> }
});

describe('findByComponent', () => {
    it('should find component', () => {
        var component = createComponent.shallow(<Master/>);

        var results = component.findByComponent(Child);

        expect(results.length).toEqual(1);
    });

    it('should find component in deeply nested components', () => {
        var component = createComponent.interleaved(<SuperMaster />);

        var results = component.findByComponent(Child);

        expect(results.length).toEqual(1);
    });

    it('should expose props from the Child component', () => {
        var component = createComponent.shallow(<Master/>);

        var results = component.findByComponent(Child);

        expect(results[0].prop('title')).toEqual('First Child');
    });

    it('should expose the props from the component', () => {
        var component = createComponent.interleaved(<SuperMaster />);

        var results = component.findByComponent(Child);

        expect(results[0].prop('title')).toEqual('First Child');
    });
});
