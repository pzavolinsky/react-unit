"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var render_instance_1 = require("./render-instance");
var resolveAndMap = function (ctx, resolver) {
    var mapAndRender = ramda_1.compose(render_instance_1.default, ctx.instanceMapper);
    var resolve = resolver(ctx.componentMapper, mapAndRender);
    return ramda_1.compose(
    // 4) MAP the ResolvedComponent (optional).
    ctx.resolveMapper, 
    // 3) RESOLVE the RenderedComponent into ResolvedComponent by applying a
    //    resolve strategy (deep, shallow, interleaved). The result replaces
    //    ShallowReactComponents with either a unknown components or HTML
    //    components. The resolution process applies a ComponentMapper to each
    //    RenderedComponent before resolving.
    resolve);
};
exports.applyRootPipeline = function (ctx, resolver) {
    return ramda_1.compose(resolveAndMap(ctx, resolver), 
    // 2) RENDER the React INSTANCE into a RenderedComponent (renderInstance)
    //    Note: at this stage, the RenderedComponent tree includes
    //    not-yet-rendered ShallowReactComponents.
    render_instance_1.default, 
    // 1) MAP the React INSTANCE (optional).
    ctx.instanceMapper);
};
var failShallowArtificial = function (comp) {
    return function (_) {
        throw "\n      Cannot call renderNew on shallow rendered component " + comp.tagName + ".\n\n      Looks like you are trying test <Parent><Stateful /></Parent> using\n      shallow render.\n\n      Consider using another rendering mode (e.g. interleaved) or refactoring\n      the test to do a shallow stateless test of <Parent /> and a shallow\n      stateful test of <Stateful />;\n    ";
    };
};
exports.applyComponentPipeline = function (ctx, resolver) {
    return function (comp) {
        return ramda_1.compose(resolveAndMap(ctx, resolver), 
        // 2) RE-RENDER the React INSTANCE into a RenderedComponent (renderNew)
        //    Note: at this stage, the RenderedComponent tree includes
        //    not-yet-rendered ShallowReactComponents.
        comp.renderNew || failShallowArtificial(comp), 
        // 1) MAP the React INSTANCE (optional).
        ctx.instanceMapper);
    };
};
