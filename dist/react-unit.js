"use strict";
var R = require('ramda');
var rendering_modes_1 = require('./rendering-modes');
var makeCreateComponent = function (create) {
    var fn = function (el) { return rendering_modes_1.createComponentDeep(create)(undefined, el); };
    fn.create = create;
    fn.shallow = function (el) { return rendering_modes_1.createComponentShallow(create)(undefined, el); };
    fn.interleaved = function (el) { return rendering_modes_1.createComponentInterleaved(create)(undefined, el); };
    return fn;
};
var exportedFn = makeCreateComponent(rendering_modes_1.createComponent);
var exclude = function (create) {
    return function (exclude) {
        var isBlacklisted = exclude.constructor === Array
            ? function (el) { return R.contains(el.type, exclude); }
            : function (el) { return el.type == exclude; };
        return function (compCtor, parent, element) {
            return isBlacklisted(element)
                ? null // TODO: extend type interface
                : create(compCtor, parent, element);
        };
    };
};
var mock = function (create) {
    return function (actual, mock) { return function (compCtor, parent, element) {
        return create(compCtor, parent, element.type != actual
            ? element
            : R.merge(element, { type: mock }));
    }; };
};
var withContext = function (create) {
    return function (context) { return function (compCtor, parent, element) {
        return create(compCtor, parent, R.merge(element, { context: context }));
    }; };
};
var addons = {
    exclude: exclude,
    mock: mock,
    withContext: withContext
};
function applyAddons(fn) {
    R.compose(R.forEach(function (_a) {
        var k = _a[0], f = _a[1];
        fn[k] = R.compose(applyAddons, makeCreateComponent, f(fn.create));
    }), R.toPairs)(addons);
    return fn;
}
;
module.exports = applyAddons(exportedFn);
