'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var R = require('ramda');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sizzle = require('./sizzle-bundle');

var Component = (function () {
  function Component(comp, parent) {
    var _this = this;

    _classCallCheck(this, Component);

    this.type = comp.type;
    this.key = comp.key;
    this.ref = comp.ref;
    this.props = comp._store && comp._store.props;
    this.texts = [];

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

  _createClass(Component, [{
    key: 'prop',
    value: function prop(name) {
      return (this.props || {})[name];
    }
  }, {
    key: 'componentProp',
    value: function componentProp(name) {
      var props = this.componentInstance && this.componentInstance._store && this.componentInstance._store.props;
      return (props || {})[name];
    }
  }, {
    key: 'findBy',
    value: function findBy(fn) {
      var ret = [];
      if (fn(this)) ret.push(this);
      var children = this.prop('children');
      if (!children) return ret;
      if (children.length === undefined) children = [children];

      return R.compose(R.concat(ret), R.filter(R.identity), R.flatten, R.map(function (c) {
        return c.findBy(fn);
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
        return TestUtils.isElementOfType(e.componentInstance, componentClass);
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

function includeText(comp) {
  return comp && excludeTextFrom.indexOf((comp.type || '').toLowerCase()) == -1;
}

var mapComponent = function mapComponent(comp, parent) {
  if (typeof comp.type === 'function') return createComponent(comp, parent);

  var newComp = new Component(comp, parent);

  if (!newComp.props) return newComp;

  var oldChildren = newComp.props.children;
  if (!oldChildren || oldChildren.length === 0) return newComp;

  var newChildren = [];

  var isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

  React.Children.forEach(newComp.props.children, function (c) {
    if (isText(typeof c)) newComp.texts.push(c);else if (c) {
      var childComp = mapComponent(c, newComp);
      newChildren.push(childComp);
      if (includeText(childComp)) {
        newComp.texts = newComp.texts.concat(childComp.texts);
      }
    }
  });

  if (newChildren.length == 1) newChildren = newChildren[0];

  newComp.props.children = newChildren;
  newComp.text = newComp.texts.join(' ');
  return newComp;
};

var createComponentInRenderer = function createComponentInRenderer(renderer, ctor, parent) {
  renderer.render(ctor);
  return mapComponent(renderer.getRenderOutput(), parent);
};

var createComponent = function createComponent(ctor, parent) {
  var shallowRenderer = TestUtils.createRenderer();
  var component = createComponentInRenderer(shallowRenderer, ctor, parent);
  component.componentInstance = ctor;
  component.renderNew = function (newCtor) {
    return createComponentInRenderer(shallowRenderer, newCtor || ctor, parent);
  };
  return component;
};

module.exports = createComponent;