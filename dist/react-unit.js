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

  // -------------------------------------------------------------------------- //
  // Before we begin, lets define some types:
  // ReactElement   :: the result of evaluating a JSX expression, that is, calling
  //                   React.createElement(type, props, children);
  // ReactComponent :: the result of rendering a ReactElement
  // UnitComponent  :: A react-unit component (see Component above) that wraps
  //                   a ReactComponent.
  // WrapFn         = (UnitComponent -> ReactComponent -> UnitComponent)
  // CreateFn       = WrapFn -> UnitComponent -> ReactElement -> UnitComponent
  //

  // renderElement
  //   :: (ReactComponent -> UnitComponent)
  //   -> ReactElement
  //   -> UnitComponent

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

var renderElement = function renderElement(mapper, reactElement) {
  var shallowRenderer = _reactAddonsTestUtils2['default'].createRenderer();
  var create = function create(reactElement) {
    shallowRenderer.render(reactElement, reactElement.context);
    var reactComponent = shallowRenderer.getRenderOutput();
    if (!reactComponent) return reactComponent; // null, undef, 0, '', etc.
    var unitComponent = mapper(reactComponent);
    unitComponent.originalComponentInstance = reactElement;
    unitComponent.renderNew = function (newElement) {
      return create(newElement || reactElement);
    };
    return unitComponent;
  };
  return create(reactElement);
};

// --- Mapping -------------------------------------------------------------- //
// mapChildren
//   :: (ReactElement | ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> { children :: [ UnitComponent ]
//      , texts :: [ String ]
//      }
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

// mapComponent
//   :: (UnitComponent -> ReactElement -> UnitComponent) -- WrapFn
//   -> UnitComponent
//   -> ReactElement | ReactComponent
//   -> UnitComponent
var mapComponent = _ramda2['default'].curry(function (compCtor, parent, item) {
  if (typeof item.type === 'function') {
    // item is a ReactElement that we need to render into a UnitComponent
    return compCtor(parent, item);
  }

  // item is ReactComponent that we can wrap in a UnitComponent and process
  // its children.
  var unitComponent = new Component(item, parent);

  if (!unitComponent.props) return unitComponent;

  var oldChildren = unitComponent.props.children;
  if (!oldChildren || oldChildren.length === 0) return unitComponent;

  var mapFn = mapComponent(compCtor, unitComponent);
  var mappedChildren = mapChildren(mapFn, unitComponent);
  unitComponent.props.children = mappedChildren.children;
  unitComponent.texts = mappedChildren.texts;
  unitComponent.text = unitComponent.texts.join('');
  return unitComponent;
});

// --- Ctors ---------------------------------------------------------------- //
// createComponent :: CreateFn
//   :: WrapFn -- (UnitComponent -> ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
var createComponent = _ramda2['default'].curry(function (compCtor, parent, reactElement) {
  var mapper = mapComponent(compCtor, parent);
  return renderElement(mapper, reactElement);
});

// Default behavior: recursively call create component
// createComponentDeep
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
var createComponentDeep = _ramda2['default'].curry(function (createComponent, parent, ctor) {
  return createComponent(createComponentDeep(createComponent), parent, ctor);
});

// Only process a single level of react components (honoring all the HTML
// in-between).
// createComponentShallow
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
var createComponentShallow = _ramda2['default'].curry(function (createComponent, parent, ctor) {
  return createComponent(function (parent, ctor) {
    var comp = new Component({
      type: ctor.type.displayName || ctor.type.name,
      _store: ctor._store,
      props: ctor.props
    }, parent);
    comp.componentInstance = ctor;
    return comp;
  }, parent, ctor);
});

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
// createComponentInterleaved
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
var createComponentInterleaved = _ramda2['default'].curry(function (createComponent, parent, ctor) {

  // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
  var create = function create(ctor, childCtor) {
    var store = ctor._store || {};

    var props = _ramda2['default'].mergeAll([store.props, ctor.props, {}]);

    var comp = new Component({
      type: ctor.type.displayName || ctor.type.name,
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

// makeCreateComponent
//   :: CreateFn
//   -> ReactElement
//   -> UnitComponent
var makeCreateComponent = function makeCreateComponent(create) {
  var fn = createComponentDeep(create, null);
  fn.create = create;
  fn.shallow = createComponentShallow(create, null);
  fn.interleaved = createComponentInterleaved(create, null);
  return fn;
};

var exportedFn = makeCreateComponent(createComponent);

var exclude = function exclude(create) {
  return function (exclude) {
    return _ramda2['default'].curry(function (compCtor, parent, ctor) {
      return _ramda2['default'].contains(ctor.type, exclude.constructor === Array ? exclude : [exclude]) ? null : create(compCtor, parent, ctor);
    });
  };
};

var mock = function mock(create) {
  return function (actual, mock) {
    return _ramda2['default'].curry(function (compCtor, parent, ctor) {
      return create(compCtor, parent, ctor.type != actual ? ctor : _ramda2['default'].merge(ctor, { type: mock }));
    });
  };
};

var withContext = function withContext(create) {
  return function (context) {
    return _ramda2['default'].curry(function (compCtor, parent, ctor) {
      return create(compCtor, parent, _ramda2['default'].merge(ctor, { context: context }));
    });
  };
};

var addons = {
  exclude: exclude,
  mock: mock,
  withContext: withContext
};

var applyAddons = function applyAddons(fn) {
  _ramda2['default'].compose(_ramda2['default'].forEach(function (_ref4) {
    var _ref42 = _slicedToArray(_ref4, 2);

    var k = _ref42[0];
    var f = _ref42[1];

    fn[k] = _ramda2['default'].compose(applyAddons, makeCreateComponent, f(fn.create));
  }), _ramda2['default'].toPairs)(addons);
  return fn;
};

module.exports = applyAddons(exportedFn);