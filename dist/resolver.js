"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var render_instance_1 = require("./render-instance");
var types_1 = require("./types");
function deepResolver(mapper, renderer) {
    return function (comp) {
        var resolve = deepResolver(mapper, renderer);
        var mapped = mapper(comp);
        if (types_1.isShallow(mapped)) {
            var newComp = renderer(mapped.instance);
            // note that newComp might be shallow again, so we need to call
            // deepResolver on it to resolve the whole the tree
            return resolve(newComp);
        }
        if (types_1.isHtml(mapped))
            return ramda_1.merge(mapped, {
                children: mapped.children.map(resolve)
            });
        return mapped;
    };
}
exports.deepResolver = deepResolver;
function shallowResolver(mapper, _) {
    return function (comp) {
        var resolve = shallowResolver(mapper, _);
        var mapped = mapper(comp);
        if (types_1.isShallow(mapped)) {
            return render_instance_1.toArtificialHtml(mapped);
        }
        if (types_1.isHtml(mapped)) {
            return ramda_1.merge(mapped, {
                children: mapped.children.map(resolve)
            });
        }
        return mapped;
    };
}
exports.shallowResolver = shallowResolver;
function interleavedResolver(mapper, renderer, nonRoot) {
    return function (comp) {
        var resolve = interleavedResolver(mapper, renderer, true);
        var mapped = mapper(comp);
        if (types_1.isShallow(mapped)) {
            var newComp = renderer(mapped.instance);
            // note that newComp might be shallow again, so we need to call
            // interleavedResolver on it to render the whole the tree
            var renderedComp = resolve(newComp);
            return render_instance_1.toArtificialHtml(mapped, renderedComp);
        }
        if (types_1.isHtml(mapped)) {
            var mappedWithChildren = ramda_1.merge(mapped, {
                children: mapped.children.map(resolve)
            });
            return nonRoot
                ? mappedWithChildren
                : render_instance_1.toArtificialHtml(mappedWithChildren, mappedWithChildren);
        }
        return mapped;
    };
}
exports.interleavedResolver = interleavedResolver;
