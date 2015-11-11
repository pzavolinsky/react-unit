'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var R = require('ramda');
var sizzle = require('./sizzle-bundle');
var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');

var Component = (function () {
  function Component(comp, parent) {
    var _this = this;

    _classCallCheck(this, Component);

    this.type = comp.type;
    this.key = comp.key;
    this.ref = comp.ref;
    this.props = R.mergeAll([comp._store && comp._store.props, comp.props, {}]);
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

  // Text functions

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

      return R.compose(R.concat(ret), R.filter(R.identity), R.flatten, R.map(function (c) {
        return c.findBy && c.findBy(fn);
      }))(children);
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
        return e.componentInstance && TestUtils.isElementOfType(e.componentInstance, componentClass);
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
      var o = {};
      o[n] = v;
      this.onChange({ target: R.merge(this.props, o) });
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
        return sizzle(s, this.root || this);
      } catch (e) {
        console.log('Sizzle error', e.stack);throw e;
      }
    }
  }]);

  return Component;
})();

var excludeTextFrom = ['option', 'optgroup', 'textarea', 'button'];

var includeText = function includeText(comp) {
  return comp && excludeTextFrom.indexOf((comp.type || '').toLowerCase()) == -1;
};

var isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

// Mapping
var mapChildren = function mapChildren(mapFn, comp) {
  var children = [];
  var texts = [];

  React.Children.forEach(comp.props.children, function (c) {
    if (isText(typeof c)) texts.push(c);else if (c) {
      var childComp = mapFn(c);
      children.push(childComp);
      if (includeText(childComp)) {
        texts = texts.concat(childComp.texts);
      }
    }
  });

  if (children.length == 1) children = children[0];

  return {
    children: children,
    texts: texts
  };
};

var mapComponent = R.curry(function (compCtor, parent, comp) {
  if (typeof comp.type === 'function') return compCtor(parent, comp);

  var newComp = new Component(comp, parent);

  if (!newComp.props) return newComp;

  var oldChildren = newComp.props.children;
  if (!oldChildren || oldChildren.length === 0) return newComp;

  var mapFn = mapComponent(compCtor, newComp);
  var mappedChildren = mapChildren(mapFn, newComp);
  newComp.props.children = mappedChildren.children;
  newComp.texts = mappedChildren.texts;
  newComp.text = newComp.texts.join(' ');
  return newComp;
});

// Ctors
var createComponentInRenderer = R.curry(function (renderer, compCtor, parent, ctor) {
  renderer.render(ctor);
  var component = mapComponent(compCtor, parent, renderer.getRenderOutput());
  component.originalComponentInstance = ctor;
  return component;
});

var createComponent = R.curry(function (compCtor, parent, ctor) {
  var shallowRenderer = TestUtils.createRenderer();
  var create = function create(ctor) {
    var c = createComponentInRenderer(shallowRenderer, compCtor, parent, ctor);
    c.renderNew = function (newCtor) {
      return create(newCtor || ctor);
    };
    return c;
  };
  return create(ctor);
});

// Default behavior: recursively call create component
var createComponentDeep = R.curry(function (parent, ctor) {
  return createComponent(createComponentDeep, parent, ctor);
});

// Only process a single level of react components (honoring all the HTML
// in-between).
var createComponentShallow = createComponent(function (parent, ctor) {
  var comp = new Component({
    type: ctor.type.displayName,
    _store: ctor._store,
    props: ctor.props
  }, parent);
  comp.componentInstance = ctor;
  return comp;
});

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
var createComponentInterleaved = R.curry(function (parent, ctor) {

  // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
  var create = function create(ctor, childCtor) {
    var store = ctor._store || {};

    var props = R.mergeAll([store.props, ctor.props, {}]);

    var comp = new Component({
      type: ctor.type.displayName,
      _store: R.merge(store, { props: props })
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

  return create(ctor, createComponent(createComponentInterleaved));
});

var exportedFn = createComponentDeep(null);
exportedFn.shallow = createComponentShallow(null);
exportedFn.interleaved = createComponentInterleaved(null);

module.exports = exportedFn;