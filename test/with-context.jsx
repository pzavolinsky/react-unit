// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

function Laur() {
  return <span>¯\_(ツ)_/¯</span>
}

describe('with-context', () => {
  describe('when a component is given a context', () => {
    it('should receive it accordingly', () => {
      var bobsContext = { bob: true };
      var component = createComponent
        .withContext(bobsContext)
        (<Laur />);

      expect(component.context).toEqual(bobsContext);
    });
  });
});
