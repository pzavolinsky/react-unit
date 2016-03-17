'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _sizzleBundle = require('./sizzle-bundle');

var _sizzleBundle2 = _interopRequireDefault(_sizzleBundle);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

// Text functions
var isText = _ramda2['default'].compose(_ramda2['default'].not, _ramda2['default'].flip(_ramda2['default'].contains)(['object', 'function']));

// Component wrapper

var Component = (function () {
  function Component(comp, parent) {
    var _this = this;

    _classCallCheck(this, Component);

    this.type = comp.type;
    this.key = comp.key;
    this.ref = comp.ref;
    this.props = _ramda2['default'].mergeAll([comp._store && comp._store.props, comp.props, {
      key: this.key,
      ref: this.ref
    }]);
    this.texts = [];
    this.comp = comp;

    // Mock root parent (to enable top-level "[attr=value]")
    if (!parent) {
      this.root = new Component({}, 'root');
      this.root.props = { children: this };
      parent = this.root;
    } else if (parent == 'root') {
      parent = undefined;
    }

    // Mock DOM
    this.ownerDocument = global.document;
    this.nodeType = 1;
    this.parentNode = parent;
    this.nodeName = this.type;
    this.getElementsByTagName = this.findByTag;
    this.getElementsByClassName = this.findByClassName;
    this.getAttribute = function (n) {
      return _this.prop(n == 'class' ? 'className' : n);
    };
    this.getAttributeNode = function (n) {
      var prop = _this.prop(n);
      return { value: prop, specified: prop !== undefined };
    };
  }

  // Mapping

  _createClass(Component, [{
    key: 'prop',
    value: function prop(name) {
      return (this.props || {})[name];
    }
  }, {
    key: 'findBy',
    value: function findBy(fn) {
      var ret = [];
      if (fn(this)) ret.push(this);
      var children = this.prop('children');
      if (!children || isText(typeof children)) return ret;
      if (children.length === undefined) children = [children];

      return _ramda2['default'].compose(_ramda2['default'].concat(ret), _ramda2['default'].filter(_ramda2['default'].identity), _ramda2['default'].flatten, _ramda2['default'].map(function (c) {
        return c.findBy && c.findBy(fn);
      }))(children);
    }
  }, {
    key: 'findByRef',
    value: function findByRef(ref) {
      return this.findBy(function (c) {
        return c.ref == ref;
      });
    }
  }, {
    key: 'findByTag',
    value: function findByTag(type) {
      return this.findBy(type == '*' ? function (c) {
        return true;
      } : function (c) {
        return c.type == type;
      });
    }
  }, {
    key: 'findByClassName',
    value: function findByClassName(search) {
      var pattern = new RegExp('(^|\\s)' + search + '(\\s|$)');
      return this.findBy(function (e) {
        return pattern.test(e.prop('className'));
      });
    }
  }, {
    key: 'findByComponent',
    value: function findByComponent(componentClass) {
      return this.findBy(function (e) {
        return e.componentInstance && _reactAddonsTestUtils2['default'].isElementOfType(e.componentInstance, componentClass);
      });
    }
  }, {
    key: 'on',
    value: function on(event, e) {
      event = 'on' + event[0].toUpperCase() + event.slice(1);
      var handler = this.props[event];
      if (!handler) throw 'Triggered unhandled ' + event + ' event: ' + new Error().stack;
      return handler(e);
    }
  }, {
    key: 'onChange',
    value: function onChange(e) {
      this.on('change', e);
    }
  }, {
    key: 'onClick',
    value: function onClick(e) {
      this.on('click', e);
    }
  }, {
    key: 'setValueKey',
    value: function setValueKey(n, v) {
      this.onChange({ target: _ramda2['default'].merge(this.props, _defineProperty({}, n, v)) });
    }
  }, {
    key: 'setValue',
    value: function setValue(v) {
      this.setValueKey('value', v);
    }
  }, {
    key: 'setChecked',
    value: function setChecked(v) {
      this.setValueKey('checked', v);
    }
  }, {
    key: 'findByQuery',
    value: function findByQuery(s) {
      try {
        return (0, _sizzleBundle2['default'])(s, this.root || this);
      } catch (e) {
        console.log('Sizzle error', e.stack);throw e;
      }
    }
  }, {
    key: 'dump',
    value: function dump(padd) {
      if (!padd) padd = '';
      var children = this.prop('children');
      var tag = this.type + _ramda2['default'].compose(_ramda2['default'].join(''), _ramda2['default'].map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k = _ref2[0];
        var v = _ref2[1];
        return ' ' + k + '=\'' + v + '\'';
      }), _ramda2['default'].filter(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var _ = _ref32[0];
        var v = _ref32[1];
        return isText(typeof v) && (v || v === 0);
      }), _ramda2['default'].toPairs, _ramda2['default'].merge({ key: this.key, ref: this.ref }), _ramda2['default'].omit(['children']))(this.props);

      if (!children || children.length === 0) {
        return this.text ? padd + '<' + tag + '>' + this.text + '</' + this.type + '>\n' : padd + '<' + tag + ' />\n';
      }

      if (isText(typeof children)) {
        return padd + '<' + tag + '>' + children + '</' + this.type + '>\n';
      }
      if (children.length === undefined) children = [children];
      var texts = _ramda2['default'].join('', _ramda2['default'].map(function (c) {
        return c.dump(padd + '  ');
      }, children));
      return padd + '<' + tag + '>\n' + texts + padd + '</' + this.type + '>\n';
    }
  }, {
    key: 'children',
    get: function get() {
      return this.props.children;
    }
  }, {
    key: 'textContent',
    get: function get() {
      return this.text;
    }
  }]);

  return Component;
})();

var mapChildren = function mapChildren(mapFn, comp) {
  var children = [];
  var texts = [];

  _react2['default'].Children.forEach(comp.props.children, function (c) {
    if (isText(typeof c)) texts.push(c);else if (c) {
      var childComp = mapFn(c);
      if (childComp !== null) {
        children.push(childComp);
        if (childComp) {
          texts = texts.concat(childComp.texts);
        }
      }
    }
  });

  if (children.length == 1 && children[0] !== null) children = children[0];

  return {
    children: children,
    texts: texts
  };
};

var mapComponent = _ramda2['default'].curry(function (compCtor, parent, comp) {
  if (typeof comp.type === 'function') return compCtor(parent, comp);

  var newComp = new Component(comp, parent);

  if (!newComp.props) return newComp;

  var oldChildren = newComp.props.children;
  if (!oldChildren || oldChildren.length === 0) return newComp;

  var mapFn = mapComponent(compCtor, newComp);
  var mappedChildren = mapChildren(mapFn, newComp);
  newComp.props.children = mappedChildren.children;
  newComp.texts = mappedChildren.texts;
  newComp.text = newComp.texts.join('');
  return newComp;
});

// Ctors
var createComponentInRenderer = _ramda2['default'].curry(function (renderer, compCtor, parent, ctor) {
  renderer.render(ctor);
  var component = mapComponent(compCtor, parent, renderer.getRenderOutput());
  component.originalComponentInstance = ctor;
  return component;
});

var createComponent = _ramda2['default'].curry(function (compCtor, parent, ctor) {
  var shallowRenderer = _reactAddonsTestUtils2['default'].createRenderer();
  var create = function create(ctor) {
    var c = createComponentInRenderer(shallowRenderer, compCtor, parent, ctor);
    c.renderNew = function (newCtor) {
      return create(newCtor || ctor);
    };
    return c;
  };
  return create(ctor);
});

var createComponentWithExclusion = _ramda2['default'].curry(function (exclude, compCtor, parent, ctor) {
  return _ramda2['default'].contains(ctor.type, exclude) ? null : createComponent(compCtor, parent, ctor);
});

// Default behavior: recursively call create component
var createComponentDeep = _ramda2['default'].curry(function (createComponent, parent, ctor) {
  return createComponent(createComponentDeep(createComponent), parent, ctor);
});

// Only process a single level of react components (honoring all the HTML
// in-between).
var createComponentShallow = _ramda2['default'].curry(function (createComponent, parent, ctor) {
  return createComponent(function (parent, ctor) {
    var comp = new Component({
      type: ctor.type.displayName,
      _store: ctor._store,
      props: ctor.props
    }, parent);
    comp.componentInstance = ctor;
    return comp;
  }, parent, ctor);
});

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
var createComponentInterleaved = _ramda2['default'].curry(function (createComponent, parent, ctor) {

  // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
  var create = function create(ctor, childCtor) {
    var store = ctor._store || {};

    var props = _ramda2['default'].mergeAll([store.props, ctor.props, {}]);

    var comp = new Component({
      type: ctor.type.displayName,
      _store: _ramda2['default'].merge(store, { props: props })
    }, parent);
    comp.componentInstance = ctor;
    comp.props.children = childCtor(comp, ctor);
    comp.renderNew = function (newCtor) {
      return create(newCtor || ctor, // renderWithCtor
      function (_, renderWithCtor) {
        return comp.props.children.renderNew(renderWithCtor);
      });
    };
    return comp;
  };

  return create(ctor, createComponent(createComponentInterleaved(createComponent)));
});

var exportedFn = createComponentDeep(createComponent, null);
exportedFn.shallow = createComponentShallow(createComponent, null);
exportedFn.interleaved = createComponentInterleaved(createComponent, null);

exportedFn.exclude = function (comps) {
  comps = comps.constructor === Array ? comps : [comps];
  var create = createComponentWithExclusion(comps);
  var fn = createComponentDeep(create, null);
  fn.shallow = createComponentShallow(create, null);
  fn.interleaved = createComponentInterleaved(create, null);
  return fn;
};

module.exports = exportedFn;