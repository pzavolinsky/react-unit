"use strict";
var ramda_1 = require('ramda');
var mockMapper = function (actual, mock) {
    return function (instance) {
        return instance.type == actual
            ? ramda_1.merge(instance, { type: mock })
            : instance;
    };
};
var mock = function (ctx) {
    return function (actual, mock) { return ramda_1.merge(ctx, {
        instanceMapper: ramda_1.compose(mockMapper(actual, mock), ctx.instanceMapper)
    }); };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mock;
//# sourceMappingURL=mock.js.map