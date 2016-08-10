// Models any React component (Stateless, Es2015 class, createClass, ...) that
// was NOT rendered yet For example:
//   <Comp .../>
//   React.createElement(MyComp, { ... })
export interface ShallowReactComponent {
  type:         'shallow'
  tagName:      string   // name / displayName of the component
  instance:     any      // this can be rendered with renderElement
}

// Models primitive HTML tags returned by a render() method
interface HtmlComponentBase {
  tagName:      string
  key?:         any
  ref?:         any
  props:        any
  renderOutput: any
  instance:     any // this can be rendered with renderElement
  children:     RenderedComponent[]
}
export interface RenderedHtmlComponent extends HtmlComponentBase {
  type:         'html'
  renderNew:    RenderNew
}

export interface ArtificialHtmlComponent extends HtmlComponentBase {
  type:         'artificial'
  renderNew?:   RenderNew
}

// Models an unknown component (null, undefined, primitive types, ...)
export interface RenderedUnknownComponent {
  type:    'unknown'
  unknown: any
}

export type RenderedComponent
  = ShallowReactComponent
  | RenderedHtmlComponent
  | ArtificialHtmlComponent
  | RenderedUnknownComponent;

export type ResolvedComponent
  = RenderedUnknownComponent
  | RenderedHtmlComponent
  | ArtificialHtmlComponent;

export type HtmlComponent
  = RenderedHtmlComponent
  | ArtificialHtmlComponent;

export const isShallow = (
  c:RenderedComponent|ResolvedComponent
):c is ShallowReactComponent =>
  c.type === 'shallow';

export const isHtml = (
  c:RenderedComponent|ResolvedComponent
):c is RenderedHtmlComponent =>
  c.type === 'html' || c.type === 'artificial';

export const isArtificialHtml = (
  c:RenderedComponent|ResolvedComponent
):c is ArtificialHtmlComponent =>
  c.type === 'artificial';

export const isUnknown = (
  c:RenderedComponent|ResolvedComponent
):c is RenderedUnknownComponent =>
  c.type === 'unknown';

export interface InstanceMapper {
  (instance:any):any
}

export interface ComponentMapper {
  (comp:RenderedComponent):RenderedComponent
}

export interface ResolvedMapper {
  (comp:ResolvedComponent):ResolvedComponent
}

export interface InstanceRenderer {
  (instance:any):RenderedComponent
}

export interface Resolver {
  ( mapper:ComponentMapper
  , renderer:InstanceRenderer
  ):(comp:RenderedComponent) => ResolvedComponent
}

export interface RenderNew {
  (instance?:any):RenderedComponent
}

export interface RenderContext {
  instanceMapper:  InstanceMapper
  componentMapper: ComponentMapper
  resolveMapper:   ResolvedMapper
}

export const defaultRenderContext:RenderContext = ({
  instanceMapper:  i => i,
  componentMapper: c => c,
  resolveMapper:   r => r
});

export interface AddOn {
  (ctx:RenderContext):(...args:any[]) => RenderContext
}
