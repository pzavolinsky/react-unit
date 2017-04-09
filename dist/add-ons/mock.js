"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var types_1 = require("../types");
var utils_1 = require("../utils");
var mockMapper = function (actual, mock) {
    return function (comp) {
        return types_1.isShallow(comp) && utils_1.isOfType(actual, comp)
            ? { type: 'shallow',
                tagName: utils_1.getTagNameForType(mock),
                instance: ramda_1.merge(comp.instance, { type: mock })
            }
            : comp;
    };
};
var mock = function (ctx) {
    return function (actual, mock) { return ramda_1.merge(ctx, {
        componentMapper: ramda_1.compose(mockMapper(actual, mock), ctx.componentMapper)
    }); };
};
exports.default = mock;
