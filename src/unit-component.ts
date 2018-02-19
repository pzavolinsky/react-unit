import * as R from 'ramda';
import { ReactInstance, HtmlComponent, isArtificialHtml } from './types';
import { isText, isOfType } from './utils';
import sizzle = require('./sizzle-bundle');

declare const global:any;

type Root = 'root';
const ROOT:Root = 'root';
const isNotRoot = (c:UnitComponent|Root):c is UnitComponent => c !== ROOT;

export interface RenderNewUnit {
  (instance:ReactInstance):UnitComponent
}

// Component wrapper
export class UnitComponent {
  type:  string; // tag name
  key:   any;
  ref:   any;
  props: any;
  text:  string;
  texts: string[];
  root:  UnitComponent;
  parentNode: UnitComponent|undefined;
  ownerDocument: any;
  comp: HtmlComponent;
  nodeType = 1;
  nodeName: string;
  renderNew: RenderNewUnit|undefined;

  constructor(
    comp:HtmlComponent,
    parent:OptionalUnitComponent|Root,
    renderNew:RenderNewUnit|undefined
  ) {
    this.type  = comp.tagName;
    this.key   = comp.key;
    this.ref   = comp.ref;
    this.props = comp.props;
    this.texts = [];
    this.comp  = comp;
    this.renderNew = renderNew;

    // Mock root parent (to enable top-level "[attr=value]")
    if (!parent) {
      this.root = new UnitComponent({} as any, ROOT, undefined);
      this.root.props = { children: this };
      this.parentNode = this.root;
    } else if (isNotRoot(parent)) {
      this.parentNode = parent;
    }

    // Mock DOM
    this.ownerDocument = global.document;
    this.nodeName = this.type;
  }

  prop(name:string) { return (this.props || {})[name]; }

  findBy(fn:(c:UnitComponent) => boolean):UnitComponent[] {
    const ret:UnitComponent[] = [];
    if (fn(this)) ret.push(this);
    let children = this.prop('children');
    if (!children || isText(children)) return ret;
    if (children.length === undefined) children = [ children ];

    return R.compose(
      R.concat(ret),
      R.filter((c:UnitComponent) => !!c),
      R.flatten,
      R.map((c:UnitComponent) => c.findBy && c.findBy(fn))
    )(children);
  }
  findByRef(ref:any) {
    return this.findBy(c => c.ref == ref);
  }
  findByTag(type:string) {
    return this.findBy(type == '*' ? (c => true) : (c => c.type == type));
  }
  findByClassName(search:string) {
    const pattern = new RegExp('(^|\\s)' + search + '(\\s|$)');
    return this.findBy(e => pattern.test(e.prop('className')));
  }
  findByComponent(componentClass:any) {
    return this.findBy(e =>
      isArtificialHtml(e.comp) && isOfType(componentClass, e.comp)
    );
  }
  on(event:string, e:any) {
    event = `on${event[0].toUpperCase() + event.slice(1)}`;
    const handler = this.props[event];
    if (!handler)
      throw `Triggered unhandled ${event} event: ${new Error().stack}`;
    return handler(e);
  }
  onChange(e:any) { this.on('change', e); }
  onClick(e:any) { this.on('click', e); }
  setValueKey(n:string, v:any ) {
    this.onChange({ target: R.merge(this.props, {[n]: v}) });
  }
  setValue(v:any) { this.setValueKey('value', v); }
  setChecked(v:boolean) { this.setValueKey('checked', v); }

  findByQuery(s:string):UnitComponent[] {
    try {
      return sizzle(s, this.root || this);
    } catch (e) { console.log('Sizzle error', e.stack); throw e; }
  }

  dump(padd:string|undefined) {
    if (!padd) padd = '';
    let children = this.prop('children');
    const tag = this.type + R.compose(
      R.join(''),
      R.map(([k, v]:[any, any]) => ` ${k}='${v}'`),
      R.filter(([_, v]:[any, any]) => isText(v) && (!!v || (v as any) === 0)),
      R.toPairs,
      R.merge({ key: this.key, ref: this.ref }),
      R.omit(['children'])
    )(this.props);

    if (!children || children.length === 0) {
      return this.text
        ? `${padd}<${tag}>${this.text}</${this.type}>\n`
        : `${padd}<${tag} />\n`;
    }

    if (isText(children)) {
      return `${padd}<${tag}>${children}</${this.type}>\n`;
    }
    if (children.length === undefined) children = [ children ];
    const texts = children
      .map((c:UnitComponent) => c.dump(padd + '  '))
      .join('');
    return `${padd}<${tag}>\n${texts}${padd}</${this.type}>\n`;
  }

  get children() {
    return this.props.children;
  }

  get textContent() {
    return this.text;
  }

  getElementsByTagName(tagName:string) {
    return this.findByTag(tagName);
  }

  getElementsByClassName(className:string) {
    return this.findByClassName(className);
  };

  getAttribute(name:string) {
    return this.prop(name == 'class' ? 'className' : name);
  }

  getAttributeNode(name:string) {
    const prop = this.prop(name);
    return { value: prop, specified: prop !== undefined };
  };
}

export type OptionalUnitComponent = UnitComponent | undefined;
