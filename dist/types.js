"use strict";
exports.isShallow = function (c) {
    return c.type === 'shallow';
};
exports.isHtml = function (c) {
    return c.type === 'html' || c.type === 'artificial';
};
exports.isArtificialHtml = function (c) {
    return c.type === 'artificial';
};
exports.isUnknown = function (c) {
    return c.type === 'unknown';
};
exports.defaultRenderContext = ({
    instanceMapper: function (i) { return i; },
    componentMapper: function (c) { return c; },
    resolveMapper: function (r) { return r; }
});
//# sourceMappingURL=types.js.map