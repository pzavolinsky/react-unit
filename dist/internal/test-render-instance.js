'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _renderInstance = require('../render-instance');

var _renderInstance2 = _interopRequireDefault(_renderInstance);

var _types = require('../types');

var React = require('react');

var WithChildren = function WithChildren(_ref) {
  var child = _ref.child;
  return React.createElement(
    'div',
    null,
    child
  );
};

describe('createComponent', function () {
  it('should load numeric children', function () {
    var renderedComponent = (0, _renderInstance2['default'])(React.createElement(WithChildren, { child: 1 }));
    expect((0, _types.isHtml)(renderedComponent)).toBe(true);

    var children = renderedComponent.children;

    expect(children.length).toBe(1);

    expect((0, _types.isUnknown)(children[0])).toBe(true);
  });
});