var R = require('ramda');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sizzle = require('./sizzle-bundle');

class Component {
  constructor(comp, parent) {
    this.type  = comp.type;
    this.key   = comp.key;
    this.ref   = comp.ref;
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
    this.getAttribute = n => this.prop(n == 'class' ? 'className' : n);
    this.getAttributeNode = n => {
      var prop = this.prop(n);
      return { value: prop, specified: prop !== undefined }
    }
  }
  prop(name) { return (this.props || {})[name]; }

  findBy(fn) {
    var ret = [];
    if (fn(this)) ret.push(this);
    var children = this.prop('children');
    if (!children) return ret;
    if (children.length === undefined) children = [ children ];

    return R.compose(
      R.concat(ret),
      R.filter(R.identity),
      R.flatten,
      R.map(c => c.findBy(fn))
    )(children);
  }
  findByTag(type) {
     return this.findBy(type == '*' ? (c => true) : (c => c.type == type));
  }
  findByClassName(search) {
    var pattern = new RegExp('(^|\\s)' + search + '(\\s|$)');
    return this.findBy(e => pattern.test(e.prop('className')));
  }
  findByComponent(componentClass) {
    return this.findBy(e => TestUtils.isElementOfType(e.originalComponent, componentClass));
  }
  on(event,e) {
    event = 'on'+event[0].toUpperCase()+event.slice(1);
    var handler = this.props[event];
    if (!handler)
      throw 'Triggered unhandled '+event+' event: '+(new Error().stack);
    return handler(e);
  }
  onChange(e) { this.on('change', e); }
  onClick(e) { this.on('click', e); }
  setValueKey(n,v) {
    var o = {};
    o[n] = v;
    this.onChange({ target: R.merge(this.props, o) })
  }
  setValue(v) { this.setValueKey('value', v) }
  setChecked(v) { this.setValueKey('checked', v) }

  findByQuery(s) {
    try {
      return sizzle(s, this.root || this);
    } catch (e) { console.log('Sizzle error', e.stack); throw e; }

  }
}

var excludeTextFrom = ['option', 'optgroup', 'textarea', 'button'];

function includeText(comp) {
  return comp && excludeTextFrom.indexOf((comp.type||'').toLowerCase()) == -1;
}

var mapComponent = (comp, parent) => {
  if (typeof comp.type === 'function') return createComponent(comp, parent);

  var newComp = new Component(comp, parent);

  if (!newComp.props) return newComp;

  var oldChildren = newComp.props.children;
  if (!oldChildren || oldChildren.length === 0) return newComp;

  var newChildren = [];

  var isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

  React.Children.forEach(newComp.props.children,
    c => {
      if (isText(typeof c)) newComp.texts.push(c);
      else if (c) {
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
}

var createComponentInRenderer = (renderer, ctor, parent) => {
  renderer.render(ctor);
  return mapComponent(renderer.getRenderOutput(), parent);
}

var createComponent = (ctor, parent) => {
  const shallowRenderer = TestUtils.createRenderer();
  var component = createComponentInRenderer(shallowRenderer, ctor, parent);
  component.originalComponent = ctor;
  component.renderNew = (newCtor) => createComponentInRenderer(
    shallowRenderer,
    newCtor||ctor,
    parent
  );
  return component;
}

module.exports = createComponent;
