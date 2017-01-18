'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _renderInstance = require('../render-instance');

var _renderInstance2 = _interopRequireDefault(_renderInstance);

var _types = require('../types');

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