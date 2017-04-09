"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var test_utils_1 = require("react-dom/test-utils");
var types_1 = require("./types");
var notText = ['object', 'function'];
exports.isText = function (v) { return !ramda_1.contains(typeof v, notText); };
exports.isOfType = function (type, comp) {
    return (types_1.isHtml(comp) || types_1.isShallow(comp)) && test_utils_1.isElementOfType(comp.instance, type);
};
exports.getTagNameForType = function (type) {
    return type.displayName || type.name || 'anonymous-component';
};
function filterChildren(fn, comp) {
    return types_1.isHtml(comp)
        ? ramda_1.merge(comp, {
            children: comp.children.filter(fn).map(function (c) { return filterChildren(fn, c); })
        })
        : comp;
}
exports.filterChildren = filterChildren;
