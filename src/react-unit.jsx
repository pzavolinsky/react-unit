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
    if (!children || isText(typeof children)) return ret;
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
    return this.findBy(e => e.componentInstance &&
      TestUtils.isElementOfType(e.componentInstance, componentClass));
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

// Text functions
var excludeTextFrom = ['option', 'optgroup', 'textarea', 'button'];

var includeText = (comp) => comp
  && excludeTextFrom.indexOf((comp.type||'').toLowerCase()) == -1;

var isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

// Mapping
var mapChildren = (mapFn, comp) => {
  var children = [];
  var texts = [];

  React.Children.forEach(comp.props.children,
    c => {
      if (isText(typeof c)) texts.push(c);
      else if (c) {
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
}

var mapComponent = R.curry((compCtor, parent, comp) => {
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
var createComponentInRenderer = R.curry((renderer, compCtor, parent, ctor) => {
  renderer.render(ctor);
  var component = mapComponent(compCtor, parent, renderer.getRenderOutput());
  component.originalComponentInstance = ctor;
  return component;
});

var createComponent = R.curry((compCtor, parent, ctor) => {
  const shallowRenderer = TestUtils.createRenderer();
  var create = createComponentInRenderer(shallowRenderer, compCtor, parent);
  var component = create(ctor);
  component.renderNew = (newCtor) => create(newCtor||ctor);
  return component;
});

// Default behavior: recursively call create component
var createComponentDeep = R.curry(
  (parent, ctor) => createComponent(createComponentDeep, parent, ctor)
);

// Only process a single level of react components (honoring all the HTML
// in-between).
var createComponentShallow = createComponent((parent, ctor) => {
  var comp = new Component({
    type: ctor.type.displayName,
    _store: ctor._store
  }, parent);
  comp.componentInstance = ctor;
  return comp;
});

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
var createComponentInterleaved = R.curry(
  (parent, ctor) => {
    var store = ctor._store || {};
    var props = R.merge(store.props, {}); // shallow copy, to be mutated

    var comp = new Component({
      type: ctor.type.displayName,
      _store: R.merge(store, { props: props })
    }, parent);
    comp.componentInstance = ctor;

    var childComp = createComponent(createComponentInterleaved, comp, ctor);

    props.children = childComp;

    return comp;
  }
);

var exportedFn = createComponentDeep(null);
exportedFn.shallow = createComponentShallow(null);
exportedFn.interleaved = createComponentInterleaved(null);

module.exports = exportedFn;
