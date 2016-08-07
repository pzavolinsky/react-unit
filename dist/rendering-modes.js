"use strict";
var types_1 = require('./types');
var mapping_1 = require('./mapping');
var render_element_1 = require('./render-element');
// createComponent :: CreateFn
//   :: WrapFn -- (UnitComponent -> ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
exports.createComponent = function (compCtor, parent, reactElement) {
    var mapper = mapping_1.mapComponent(compCtor, parent);
    return render_element_1.default(mapper, reactElement);
};
// Default behavior: recursively call create component
// createComponentDeep
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
function createComponentDeep(createComponentFn) {
    return function (parent, element) {
        return createComponentFn(createComponentDeep(createComponentFn), parent, element);
    };
}
exports.createComponentDeep = createComponentDeep;
// Only process a single level of react components (honoring all the HTML
// in-between).
// createComponentShallow
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
var createShallowElement = function (parent, element) {
    var comp = new types_1.UnitComponent(element, parent);
    comp.componentInstance = element;
    return comp;
};
function createComponentShallow(createComponentFn) {
    return function (parent, element) {
        return createComponentFn(createShallowElement, parent, element);
    };
}
exports.createComponentShallow = createComponentShallow;
// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
// createComponentInterleaved
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
function createComponentInterleaved(createComponentFn) {
    // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
    function create(createRealComponent, parent, el) {
        var artificialParent = createShallowElement(parent, el);
        var realComponent = createRealComponent(artificialParent, el);
        artificialParent.props.children = realComponent;
        artificialParent.renderNew = function (newElement) {
            if (newElement === void 0) { newElement = el; }
            return create(function (newParent) {
                // this implementation of createRealComponent actually updates the
                // component by calling renderNew:
                var newComponent = realComponent.renderNew(newElement);
                newComponent.parentNode = newParent;
                return newComponent;
            }, parent, newElement);
        };
        return artificialParent;
    }
    var createRealComponent = function (artificialParent, element) {
        return createComponentFn(createComponentInterleaved(createComponentFn), artificialParent, element);
    };
    return function (parent, element) {
        return create(createRealComponent, parent, element);
    };
}
exports.createComponentInterleaved = createComponentInterleaved;
;
