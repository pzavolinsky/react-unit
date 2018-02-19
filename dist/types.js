"use strict";
// The goal of react-unit is to process react `instances` and turn them into
// `UnitComponents`. So, when all is said and done,react-unit looks like:
//
// function createComponent(instance:ReactInstance):UnitComponent;
//
// UnitComponent is a bit complex and deserves a whole file, see
// `unit-component.ts`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRenderContext = ({
    instanceMapper: function (i) { return i; },
    componentMapper: function (c) { return c; },
    resolveMapper: function (r) { return r; }
});
// === Type guards ========================================================== //
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
