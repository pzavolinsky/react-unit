// Note: you should use var createComponent = require('react-unit');
var createComponent = require('./react-unit');
var React = require('react');

function Failure() {
  throw new Error('this singleton is a failure');
}

function Success() {
  return (<span className="success"></span>);
}

describe('fail', () => {
  describe('when return false', () => {
    it('will do a just in time exclude', () => {
      var err = null;

      var component = createComponent
        .fail((_err) => {
          err = _err;
          return false;
        })
        (<Failure />);

      expect(err.constructor).toEqual(Error);
      expect(typeof component).toEqual('object');
    });
  });
  describe('when error not handled', () => {
    it('should blow up', () => {
      var err = null;
      try {
        createComponent
          .fail((_err, component) => {})
          (<Failure />);
      } catch (e) {
        err = e;
      }

      expect(err.constructor).toEqual(Error);
    })
  });
  describe('when return a component', () => {
    it('will do a just in time mock', () => {
      var err = null;
      var component = createComponent
        .fail(() => {
          /** NOTE, PLEASE DON'T DO THIS IN A REAL WORLD TEST!!!
           *  Please at least detect what is failing so that the whole thing isn't blowing up
           */
          return (<Success />);
        })
        (<Failure />);

      expect(component.findByQuery('.success').length).toEqual(1);
    })
  });
});
