"use strict";
var react_addons_test_utils_1 = require('react-addons-test-utils');
// renderElement
//   :: (ReactComponent -> UnitComponent)
//   -> ReactElement
//   -> UnitComponent
var renderElement = function (mapper, reactElement) {
    var shallowRenderer = react_addons_test_utils_1.createRenderer();
    function create(reactElement) {
        shallowRenderer.render(reactElement, reactElement.context);
        var reactComponent = shallowRenderer.getRenderOutput();
        if (!reactComponent)
            return reactComponent; // null, undef, 0, '', etc.
        var unitComponent = mapper(reactComponent);
        unitComponent.originalComponentInstance = reactElement;
        unitComponent.renderNew = function (newElement) { return create(newElement || reactElement); };
        return unitComponent;
    }
    return create(reactElement);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renderElement;
