"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ramda_1 = require("ramda");
var ReactShallowRenderer = require("react-test-renderer/shallow");
var types_1 = require("./types");
var utils_1 = require("./utils");
// --- Rendered Component Wrapper Functions --------------------------------- //
function wrapShallowReactComponent(renderOutput) {
    var type = renderOutput.type;
    var tagName = utils_1.getTagNameForType(type);
    return {
        type: 'shallow',
        tagName: tagName,
        instance: renderOutput
    };
}
;
var getPropsForOutput = function (_a) {
    var key = _a.key, ref = _a.ref, props = _a.props, _store = _a._store // tslint:disable-line
    ;
    return ramda_1.mergeAll([
        _store && _store.props,
        props,
        { key: key, ref: ref }
    ]);
};
function wrapHtmlComponent(renderNew, renderOutput, instance) {
    var type = renderOutput.type, key = renderOutput.key, ref = renderOutput.ref;
    var props = getPropsForOutput(renderOutput);
    var children = props.children
        ? react_1.Children.map(props.children, function (c) { return processRenderOutput(renderNew, c, c); })
        : [];
    return {
        type: 'html',
        tagName: type,
        key: key,
        ref: ref,
        props: props,
        renderOutput: renderOutput,
        instance: instance,
        children: children,
        renderNew: renderNew
    };
}
;
function wrapUnknownComponent(renderOutput) {
    return {
        type: 'unknown',
        unknown: renderOutput
    };
}
function processRenderOutput(renderNew, renderOutput, instance) {
    if (!renderOutput) {
        // e.g. render() { return undefined; }
        return wrapUnknownComponent(renderOutput);
    }
    if (typeof renderOutput.type === 'function') {
        // shallowRender reached another React component and stopped
        // renderOutput is the spec for that (child) component
        return wrapShallowReactComponent(renderOutput);
    }
    if (renderOutput.type && renderOutput.props) {
        // shallowRender returned an HTML component
        return wrapHtmlComponent(renderNew, renderOutput, instance);
    }
    return wrapUnknownComponent(renderOutput);
}
// --- Public API ----------------------------------------------------------- //
exports.toArtificialHtml = function (comp, child) { return ({
    type: 'artificial',
    tagName: utils_1.getTagNameForType(comp.instance.type),
    props: getPropsForOutput(comp.instance),
    renderOutput: comp.instance,
    instance: comp.instance,
    children: child ? [child] : [],
    renderNew: child && types_1.isHtml(child) ? child.renderNew : undefined
}); };
var renderInstance = function (instance) {
    var shallowRenderer = new ReactShallowRenderer();
    function create(componentInstance) {
        shallowRenderer.render(componentInstance, componentInstance.context);
        var renderOutput = shallowRenderer.getRenderOutput();
        var renderNew = function (newInstance) {
            return create(newInstance || componentInstance);
        };
        return processRenderOutput(renderNew, renderOutput, componentInstance);
    }
    return create(instance);
};
exports.default = renderInstance;
