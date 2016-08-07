"use strict";
var react_1 = require('react');
var ramda_1 = require('ramda');
var types_1 = require('./types');
var utils_1 = require('./utils');
// --- Mapping -------------------------------------------------------------- //
// mapChildren
//   :: (ReactElement | ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> { children :: [ UnitComponent ]
//      , texts :: [ String ]
//      }
var mapChildren = function (mapFn, comp) {
    var children = [];
    var texts = [];
    react_1.Children.forEach(comp.props.children, function (c) {
        if (utils_1.isText(c))
            texts.push(c);
        else if (c) {
            var childComp = mapFn(c);
            if (childComp !== null && childComp !== undefined) {
                children.push(childComp);
                if (childComp) {
                    texts = texts.concat(childComp.texts);
                }
            }
        }
    });
    return {
        children: children.length == 1 && !ramda_1.isNil(children[0])
            ? children[0]
            : children,
        texts: texts
    };
};
// mapComponent
//   :: (UnitComponent -> ReactElement -> UnitComponent) -- WrapFn
//   -> UnitComponent
//   -> ReactElement | ReactComponent
//   -> UnitComponent
function mapComponent(compCtor, parent) {
    return function (item) {
        if (typeof item.type === 'function') {
            // item is a ReactElement that we need to render into a UnitComponent
            return compCtor(parent, item);
        }
        // item is ReactComponent that we can wrap in a UnitComponent and process
        // its children.
        var unitComponent = new types_1.UnitComponent(item, parent);
        if (!unitComponent.props)
            return unitComponent;
        var oldChildren = unitComponent.props.children;
        if (!oldChildren || oldChildren.length === 0)
            return unitComponent;
        var mapFn = mapComponent(compCtor, unitComponent);
        var mappedChildren = mapChildren(mapFn, unitComponent);
        unitComponent.props.children = mappedChildren.children;
        unitComponent.texts = mappedChildren.texts;
        unitComponent.text = unitComponent.texts.join('');
        return unitComponent;
    };
}
exports.mapComponent = mapComponent;
