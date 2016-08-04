// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var CustomComponent = React.createClass({
  render: function() {
    return <ul className={ this.props.className }>{ this.props.children }</ul>
  },

  hiMom: function() {
    return 'hi mom!';
  },

  mom: {}
});

var Parent = (props) => {
  return (<div>{ props.children }</div>);
};

describe('class-access', () => {
  describe('when calling a method that exists in the component class being tested', () => {
    it('calls like it should', () => {
      var component = createComponent(<CustomComponent />);
      expect(component.hiMom()).toEqual('hi mom!');
    });
  });
  describe('on a child component', () => {
    describe('when calling a method that exists in the component class being tested', () => {
      it('calls like it should', () => {
        var parentComponent = createComponent(
          <Parent>
            <CustomComponent className="foo" />
          </Parent>
        );
        var childComponent = parentComponent.findByQuery('.foo')[0];
        expect(childComponent.hiMom()).toEqual('hi mom!');
      });
    });
  });
});
