import R from 'ramda';
import sizzle from './sizzle-bundle';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

// Text functions
const isText = R.compose(R.not, R.flip(R.contains)(['object', 'function']));

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
      const prop = this.prop(n);
      return { value: prop, specified: prop !== undefined }
    };
  }
  prop(name) { return (this.props || {})[name]; }

  findBy(fn) {
    const ret = [];
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
    const pattern = new RegExp('(^|\\s)' + search + '(\\s|$)');
    return this.findBy(e => pattern.test(e.prop('className')));
  }
  findByComponent(componentClass) {
    return this.findBy(e => e.componentInstance &&
      TestUtils.isElementOfType(e.componentInstance, componentClass));
  }
  on(event,e) {
    event = 'on'+event[0].toUpperCase()+event.slice(1);
    const handler = this.props[event];
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
    const tag = this.type + R.compose(
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
    const texts = R.join('', R.map(c => c.dump(padd+'  '), children));
    return `${padd}<${tag}>\n${texts}${padd}</${this.type}>\n`;
  }

  get children() {
    return this.props.children;
  }

  get textContent() {
    return this.text;
  }
}

// Mapping
const mapChildren = (mapFn, comp) => {
  var children = [];
  var texts = [];

  React.Children.forEach(comp.props.children,
    c => {
      if (isText(typeof c)) texts.push(c);
      else if (c) {
        const childComp = mapFn(c);
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

const mapComponent = R.curry((compCtor, parent, comp) => {
  if (typeof comp.type === 'function') return compCtor(parent, comp);

  const newComp = new Component(comp, parent);

  if (!newComp.props) return newComp;

  const oldChildren = newComp.props.children;
  if (!oldChildren || oldChildren.length === 0) return newComp;

  const mapFn = mapComponent(compCtor, newComp);
  const mappedChildren = mapChildren(mapFn, newComp);
  newComp.props.children = mappedChildren.children;
  newComp.texts = mappedChildren.texts;
  newComp.text = newComp.texts.join('');
  return newComp;
});

// Ctors
const createComponentInRenderer = R.curry((renderer, compCtor, parent, ctor) => {
  renderer.render(ctor);
  const component = mapComponent(compCtor, parent, renderer.getRenderOutput());
  component.originalComponentInstance = ctor;
  return component;
});

const createComponent = R.curry((compCtor, parent, ctor) => {
  const shallowRenderer = TestUtils.createRenderer();
  const create = ctor => {
    const c = createComponentInRenderer(shallowRenderer, compCtor, parent, ctor);
    c.renderNew = newCtor => create(newCtor||ctor);
    return c;
  };
  return create(ctor);
});

const createComponentWithExclusion = R.curry(
  (exclude, compCtor, parent, ctor) => (R.contains(ctor.type, exclude))
    ? null
    : createComponent(compCtor, parent, ctor)
);

const createComponentWithMock = R.curry(
  (actuals, mocks, compCtor, parent, ctor) => {
    const i = R.indexOf(ctor.type, actuals);
    if (i < 0) return createComponent(compCtor, parent, ctor);
    const mock = mocks[i];
    const comp = {
      $$typeof: ctor.$$typeof,
      type: mock,
      _store: ctor._store,
      props: ctor.props
    };

    return createComponent(compCtor, parent, comp);
  }
);

// Default behavior: recursively call create component
const createComponentDeep = R.curry(
  (createComponent, parent, ctor) => createComponent(
    createComponentDeep(createComponent), parent, ctor)
);

// Only process a single level of react components (honoring all the HTML
// in-between).
const createComponentShallow = R.curry(
  (createComponent, parent, ctor) => createComponent(
    (parent, ctor) => {
      const comp = new Component({
        type: ctor.type.displayName,
        _store: ctor._store,
        props: ctor.props
      }, parent);
      comp.componentInstance = ctor;
      return comp;
    },
    parent,
    ctor
  )
);

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
const createComponentInterleaved = R.curry(
  (createComponent, parent, ctor) => {

    // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
    const create = (ctor, childCtor) => {
      const store = ctor._store || {};

      const props = R.mergeAll([store.props, ctor.props, {}]);

      const comp = new Component({
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
    };

    return create(
      ctor,
      createComponent(createComponentInterleaved(createComponent))
    );
  }
);

const makeCreateComponent = create => {
  const fn = createComponentDeep(create, null);
  fn.shallow = createComponentShallow(create, null);
  fn.interleaved = createComponentInterleaved(create, null);
  return fn;
};

const exportedFn = makeCreateComponent(createComponent);

exportedFn.exclude = (comps) => {
  comps = comps.constructor === Array
    ? comps
    : [ comps ];
  const create = createComponentWithExclusion(comps);
  return makeCreateComponent(create);
};

exportedFn.mock = (actual, mock) => {
  const actuals = [actual];
  const mocks = [mock];
  const create = createComponentWithMock(actuals, mocks);
  const fn = makeCreateComponent(create);
  fn.mock = function(actual, mock) {
    actuals.push(actual);
    mocks.push(mock);
    return fn;
  };
  return fn;
};

module.exports = exportedFn;
