"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var unit_component_1 = require("./unit-component");
function wrapRenderedIntoUnitComponent(parent, htmlComponent, componentPipeline) {
    var unitComponent = new unit_component_1.UnitComponent(htmlComponent, parent, componentPipeline(htmlComponent));
    var children = [];
    var texts = [];
    htmlComponent.children.forEach(function (c) {
        if (types_1.isUnknown(c)) {
            var unknown = c.unknown;
            if (unknown !== undefined && unknown !== null) {
                texts.push(unknown.toString());
            }
        }
        else if (types_1.isHtml(c)) {
            var child = wrapRenderedIntoUnitComponent(unitComponent, c, componentPipeline);
            children.push(child);
            texts = texts.concat(child.texts);
        }
        // we ignore NotRenderedReactComponents
    });
    unitComponent.props.children = children;
    unitComponent.texts = texts;
    unitComponent.text = texts.join('');
    return unitComponent;
}
exports.default = wrapRenderedIntoUnitComponent;
