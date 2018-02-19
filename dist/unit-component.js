"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var types_1 = require("./types");
var utils_1 = require("./utils");
var sizzle = require("./sizzle-bundle");
var ROOT = 'root';
var isNotRoot = function (c) { return c !== ROOT; };
// Component wrapper
var UnitComponent = /** @class */ (function () {
    function UnitComponent(comp, parent, renderNew) {
        this.nodeType = 1;
        this.type = comp.tagName;
        this.key = comp.key;
        this.ref = comp.ref;
        this.props = comp.props;
        this.texts = [];
        this.comp = comp;
        this.renderNew = renderNew;
        // Mock root parent (to enable top-level "[attr=value]")
        if (!parent) {
            this.root = new UnitComponent({}, ROOT, undefined);
            this.root.props = { children: this };
            this.parentNode = this.root;
        }
        else if (isNotRoot(parent)) {
            this.parentNode = parent;
        }
        // Mock DOM
        this.ownerDocument = global.document;
        this.nodeName = this.type;
    }
    UnitComponent.prototype.prop = function (name) { return (this.props || {})[name]; };
    UnitComponent.prototype.findBy = function (fn) {
        var ret = [];
        if (fn(this))
            ret.push(this);
        var children = this.prop('children');
        if (!children || utils_1.isText(children))
            return ret;
        if (children.length === undefined)
            children = [children];
        return R.compose(R.concat(ret), R.filter(function (c) { return !!c; }), R.flatten, R.map(function (c) { return c.findBy && c.findBy(fn); }))(children);
    };
    UnitComponent.prototype.findByRef = function (ref) {
        return this.findBy(function (c) { return c.ref == ref; });
    };
    UnitComponent.prototype.findByTag = function (type) {
        return this.findBy(type == '*' ? (function (c) { return true; }) : (function (c) { return c.type == type; }));
    };
    UnitComponent.prototype.findByClassName = function (search) {
        var pattern = new RegExp('(^|\\s)' + search + '(\\s|$)');
        return this.findBy(function (e) { return pattern.test(e.prop('className')); });
    };
    UnitComponent.prototype.findByComponent = function (componentClass) {
        return this.findBy(function (e) {
            return types_1.isArtificialHtml(e.comp) && utils_1.isOfType(componentClass, e.comp);
        });
    };
    UnitComponent.prototype.on = function (event, e) {
        event = "on" + (event[0].toUpperCase() + event.slice(1));
        var handler = this.props[event];
        if (!handler)
            throw "Triggered unhandled " + event + " event: " + new Error().stack;
        return handler(e);
    };
    UnitComponent.prototype.onChange = function (e) { this.on('change', e); };
    UnitComponent.prototype.onClick = function (e) { this.on('click', e); };
    UnitComponent.prototype.setValueKey = function (n, v) {
        this.onChange({ target: R.merge(this.props, (_a = {}, _a[n] = v, _a)) });
        var _a;
    };
    UnitComponent.prototype.setValue = function (v) { this.setValueKey('value', v); };
    UnitComponent.prototype.setChecked = function (v) { this.setValueKey('checked', v); };
    UnitComponent.prototype.findByQuery = function (s) {
        try {
            return sizzle(s, this.root || this);
        }
        catch (e) {
            console.log('Sizzle error', e.stack);
            throw e;
        }
    };
    UnitComponent.prototype.dump = function (padd) {
        if (!padd)
            padd = '';
        var children = this.prop('children');
        var tag = this.type + R.compose(R.join(''), R.map(function (_a) {
            var k = _a[0], v = _a[1];
            return " " + k + "='" + v + "'";
        }), R.filter(function (_a) {
            var _ = _a[0], v = _a[1];
            return utils_1.isText(v) && (!!v || v === 0);
        }), R.toPairs, R.merge({ key: this.key, ref: this.ref }), R.omit(['children']))(this.props);
        if (!children || children.length === 0) {
            return this.text
                ? padd + "<" + tag + ">" + this.text + "</" + this.type + ">\n"
                : padd + "<" + tag + " />\n";
        }
        if (utils_1.isText(children)) {
            return padd + "<" + tag + ">" + children + "</" + this.type + ">\n";
        }
        if (children.length === undefined)
            children = [children];
        var texts = children
            .map(function (c) { return c.dump(padd + '  '); })
            .join('');
        return padd + "<" + tag + ">\n" + texts + padd + "</" + this.type + ">\n";
    };
    Object.defineProperty(UnitComponent.prototype, "children", {
        get: function () {
            return this.props.children;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UnitComponent.prototype, "textContent", {
        get: function () {
            return this.text;
        },
        enumerable: true,
        configurable: true
    });
    UnitComponent.prototype.getElementsByTagName = function (tagName) {
        return this.findByTag(tagName);
    };
    UnitComponent.prototype.getElementsByClassName = function (className) {
        return this.findByClassName(className);
    };
    ;
    UnitComponent.prototype.getAttribute = function (name) {
        return this.prop(name == 'class' ? 'className' : name);
    };
    UnitComponent.prototype.getAttributeNode = function (name) {
        var prop = this.prop(name);
        return { value: prop, specified: prop !== undefined };
    };
    ;
    return UnitComponent;
}());
exports.UnitComponent = UnitComponent;
