"use strict";
var ramda_1 = require('ramda');
var withContextMapper = function (context) {
    return function (instance) { return ramda_1.merge(instance, { context: context }); };
};
var withContext = function (ctx) {
    return function (context) { return ramda_1.merge(ctx, {
        instanceMapper: ramda_1.compose(withContextMapper(context), ctx.instanceMapper)
    }); };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = withContext;
//# sourceMappingURL=with-context.js.map