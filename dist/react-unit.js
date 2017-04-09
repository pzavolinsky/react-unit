"use strict";
var R = require("ramda");
var types_1 = require("./types");
var resolver_1 = require("./resolver");
var pipeline_1 = require("./pipeline");
var wrapper_1 = require("./wrapper");
var add_ons_1 = require("./add-ons");
var createComponent = function (ctx, resolver) {
    var rootPipeline = pipeline_1.applyRootPipeline(ctx, resolver);
    var componentPipeline = pipeline_1.applyComponentPipeline(ctx, resolver);
    function wrap(resolved) {
        return types_1.isUnknown(resolved)
            ? resolved.unknown
            : wrapper_1.default(undefined, resolved, function (c) { return function (i) { return wrap(componentPipeline(c)(i)); }; });
    }
    return R.compose(wrap, rootPipeline);
};
var makeCreateComponent = function (ctx) {
    var fn = createComponent(ctx, resolver_1.deepResolver);
    fn.shallow = createComponent(ctx, resolver_1.shallowResolver);
    fn.interleaved = createComponent(ctx, resolver_1.interleavedResolver);
    fn.ctx = ctx;
    return fn;
};
function applyAddons(fn) {
    R.toPairs(add_ons_1.default).forEach(function (_a) {
        var name = _a[0], addOn = _a[1];
        fn[name] =
            R.compose(applyAddons, makeCreateComponent, addOn(fn.ctx));
    });
    return fn;
}
;
module.exports = applyAddons(makeCreateComponent(types_1.defaultRenderContext));
