"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var instanceLogger = function (instance) {
    console.log('[instance]', instance);
    return instance;
};
var componentLogger = function (comp) {
    console.log('[component]', comp);
    return comp;
};
var resolveLogger = function (comp) {
    console.log('[resolved]', comp);
    return comp;
};
var debug = function (ctx) { return function () {
    return ramda_1.merge(ctx, {
        instanceMapper: ramda_1.compose(instanceLogger, ctx.instanceMapper),
        componentMapper: ramda_1.compose(componentLogger, ctx.componentMapper),
        resolveMapper: ramda_1.compose(resolveLogger, ctx.resolveMapper)
    });
}; };
exports.default = debug;
