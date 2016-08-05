// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

var Nulled = (props) => {
  return null;
};

describe('null', () => {
  it('can be handled', () => {
    var component = createComponent(<Nulled />);

    expect(typeof component).toEqual('object');
  });
});
