"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var utils_1 = require("../utils");
var excludeMapper = function (exclude) {
    var allowed = exclude.constructor === Array
        ? function (comp) { return !ramda_1.any(function (t) { return utils_1.isOfType(t, comp); }, exclude); }
        : function (comp) { return !utils_1.isOfType(exclude, comp); };
    return function (comp) { return utils_1.filterChildren(allowed, comp); };
};
var exclude = function (ctx) {
    return function (exclude) { return ramda_1.merge(ctx, {
        componentMapper: ramda_1.compose(excludeMapper(exclude), ctx.componentMapper)
    }); };
};
exports.default = exclude;
