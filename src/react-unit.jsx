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
const renderElement = (mapper, reactElement) => {
  const shallowRenderer = TestUtils.createRenderer();
  const create = reactElement => {
    shallowRenderer.render(reactElement, reactElement.context);
    const reactComponent = shallowRenderer.getRenderOutput();
    if (!reactComponent) return reactComponent; // null, undef, 0, '', etc.
    const unitComponent = mapper(reactComponent);
    unitComponent.originalComponentInstance = reactElement;
    unitComponent.renderNew = newElement => create(newElement || reactElement);
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

// mapComponent
//   :: (UnitComponent -> ReactElement -> UnitComponent) -- WrapFn
//   -> UnitComponent
//   -> ReactElement | ReactComponent
//   -> UnitComponent
const mapComponent = R.curry((compCtor, parent, item) => {
  if (typeof item.type === 'function') {
    // item is a ReactElement that we need to render into a UnitComponent
    return compCtor(parent, item);
  }

  // item is ReactComponent that we can wrap in a UnitComponent and process
  // its children.
  const unitComponent = new Component(item, parent);

  if (!unitComponent.props) return unitComponent;

  const oldChildren = unitComponent.props.children;
  if (!oldChildren || oldChildren.length === 0) return unitComponent;

  const mapFn = mapComponent(compCtor, unitComponent);
  const mappedChildren = mapChildren(mapFn, unitComponent);
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
const createComponent = R.curry((compCtor, parent, reactElement) => {
  const mapper = mapComponent(compCtor, parent);
  return renderElement(mapper, reactElement);
});

// Default behavior: recursively call create component
// createComponentDeep
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
const createComponentDeep = R.curry(
  (createComponent, parent, ctor) => createComponent(
    createComponentDeep(createComponent), parent, ctor)
);

// Only process a single level of react components (honoring all the HTML
// in-between).
// createComponentShallow
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
const createComponentShallow = R.curry(
  (createComponent, parent, ctor) => createComponent(
    (parent, ctor) => {
      const comp = new Component({
        type: ctor.type.displayName || ctor.type.name,
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
// createComponentInterleaved
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
const createComponentInterleaved = R.curry(
  (createComponent, parent, ctor) => {

    // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
    const create = (ctor, childCtor) => {
      const store = ctor._store || {};

      const props = R.mergeAll([store.props, ctor.props, {}]);

      const comp = new Component({
        type: ctor.type.displayName || ctor.type.name,
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

// makeCreateComponent
//   :: CreateFn
//   -> ReactElement
//   -> UnitComponent
const makeCreateComponent = create => {
  const fn = createComponentDeep(create, null);
  fn.create = create;
  fn.shallow = createComponentShallow(create, null);
  fn.interleaved = createComponentInterleaved(create, null);
  return fn;
};

const exportedFn = makeCreateComponent(createComponent);


const exclude = create => exclude => R.curry((compCtor, parent, ctor) =>
  R.contains(
    ctor.type,
    exclude.constructor === Array ? exclude : [ exclude ]
  ) ? null
    : create(compCtor, parent, ctor)
);

const mock = create => (actual, mock) => R.curry((compCtor, parent, ctor) =>
  create(
    compCtor,
    parent,
    ctor.type != actual
      ? ctor
      : R.merge(ctor, { type: mock })
  )
);

const withContext = create => context => R.curry((compCtor, parent, ctor) =>
  create(
    compCtor,
    parent,
    R.merge(ctor, { context })
  )
);

const addons = {
  exclude,
  mock,
  withContext
};

const applyAddons = fn => {
  R.compose(
    R.forEach(([k,f]) => {
      fn[k] = R.compose(applyAddons, makeCreateComponent, f(fn.create));
    }),
    R.toPairs
  )(addons);
  return fn;
};

module.exports = applyAddons(exportedFn);
