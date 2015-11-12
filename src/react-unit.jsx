var R = require('ramda');
var sizzle = require('./sizzle-bundle');
var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');

// Text functions
var excludeTextFrom = ['option', 'optgroup', 'textarea', 'button'];

var includeText = (comp) => comp
  && excludeTextFrom.indexOf((comp.type||'').toLowerCase()) == -1;

var isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

// Component wrapper
class Component {
  constructor(comp, parent) {
    this.type  = comp.type;
    this.key   = comp.key;
    this.ref   = comp.ref;
    this.props = R.mergeAll([comp._store && comp._store.props, comp.props, {
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
      R.map(c => c.findBy && c.findBy(fn))
    )(children);
  }
  findByRef(ref) {
    return this.findBy(c => c.ref == ref);
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
    this.onChange({ target: R.merge(this.props, {[n]: v}) })
  }
  setValue(v) { this.setValueKey('value', v) }
  setChecked(v) { this.setValueKey('checked', v) }

  findByQuery(s) {
    try {
      return sizzle(s, this.root || this);
    } catch (e) { console.log('Sizzle error', e.stack); throw e; }
  }

  dump(padd) {
    if (!padd) padd = '';
    var children = this.prop('children');
    var tag = this.type + R.compose(
      R.join(''),
      R.map(([k,v]) => ` ${k}='${v}'`),
      R.filter(([_,v]) => isText(typeof v) && (v || v === 0)),
      R.toPairs,
      R.merge({ key: this.key, ref: this.ref }),
      R.omit(['children'])
    )(this.props);

    if (!children || children.length === 0) {
      return this.text
        ? `${padd}<${tag}>${this.text}</${this.type}>\n`
        : `${padd}<${tag} />\n`;
    }

    if (isText(typeof children)) {
      return `${padd}<${tag}>${children}</${this.type}>\n`;
    }
    if (children.length === undefined) children = [ children ];
    var texts = R.join('', R.map(c => c.dump(padd+'  '), children));
    return `${padd}<${tag}>\n${texts}${padd}</${this.type}>\n`;
  }
}

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
};

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
  var create = ctor => {
    var c = createComponentInRenderer(shallowRenderer, compCtor, parent, ctor);
    c.renderNew = newCtor => create(newCtor||ctor);
    return c;
  }
  return create(ctor);
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
    _store: ctor._store,
    props: ctor.props
  }, parent);
  comp.componentInstance = ctor;
  return comp;
});

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
var createComponentInterleaved = R.curry(
  (parent, ctor) => {

    // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
    var create = (ctor, childCtor) => {
      var store = ctor._store || {};

      var props = R.mergeAll([store.props, ctor.props, {}]);

      var comp = new Component({
        type: ctor.type.displayName,
        _store: R.merge(store, { props: props })
      }, parent);
      comp.componentInstance = ctor;
      comp.props.children = childCtor(comp, ctor);
      comp.renderNew = newCtor => create(
        newCtor || ctor, // renderWithCtor
        (_, renderWithCtor) => comp.props.children.renderNew(renderWithCtor)
      );
      return comp;
    }

    return create(ctor, createComponent(createComponentInterleaved));
  }
);

var exportedFn = createComponentDeep(null);
exportedFn.shallow = createComponentShallow(null);
exportedFn.interleaved = createComponentInterleaved(null);

module.exports = exportedFn;
