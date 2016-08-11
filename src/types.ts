// The goal of react-unit is to process react `instances` and turn them into
// `UnitComponents`. So, when all is said and done,react-unit looks like:
//
// function createComponent(instance:ReactInstance):UnitComponent;
//
// UnitComponent is a bit complex and deserves a whole file, see
// `unit-component.ts`.

// ReactInstance: this is the return type of React.createElement, that is:
//
//   const instance = <MyComponent prop1={1} props2={2} />;
//
export interface ReactInstance {
  type: string & { name?:string, displayName?:string }
  context?: any
  // more secret stuff used by React's (shallow) render
}

// To apply this transformation, we use a pipeline of different steps:

// === Pipeline ============================================================= //

// 1) We apply an optional transformation to the ReactInstance
export interface InstanceMapper {
  (instance:ReactInstance):ReactInstance
}

// 2) We render the instance into a shallow tree of rendered components
export interface InstanceRenderer {
  (instance:ReactInstance):RenderedComponent
}
export type RenderedComponent
  = ShallowReactComponent
  | RenderedHtmlComponent
  | ArtificialHtmlComponent
  | RenderedUnknownComponent;

// 3) We apply an optional transformation to the RenderedComponent
export interface ComponentMapper {
  (comp:RenderedComponent):RenderedComponent
}

// 4) We resolve the rendered component by transforming shallow components into
//    something else. Different resolution strategies (see `resolver.ts`) will
//    do different things, like render the component, replace it or both.
export interface Resolver {
  ( mapper:ComponentMapper
  , renderer:InstanceRenderer
  ):(comp:RenderedComponent) => ResolvedComponent
}
export type ResolvedComponent
  = RenderedUnknownComponent
  | RenderedHtmlComponent
  | ArtificialHtmlComponent;

// 5) We apply an optional transformation to the resolved component
export interface ResolvedMapper {
  (comp:ResolvedComponent):ResolvedComponent
}

// Putting it all together:
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

// === Add-ons ============================================================== //
// Add-ons are just transformations to the render context using some
// user-supplied arguments.
export interface AddOn {
  (ctx:RenderContext):(...args:any[]) => RenderContext
}

// === Rendered Type specificatons ========================================== //

// Models any React component (Stateless, Es2015 class, createClass, ...) that
// was NOT rendered yet For example:
//   <Comp .../>
//   React.createElement(MyComp, { ... })
export interface ShallowReactComponent {
  type:         'shallow'
  tagName:      string   // name / displayName of the component
  instance:     ReactInstance // this can be rendered with renderInstance
}

// Models primitive HTML tags returned by a render() method
interface HtmlComponentBase {
  tagName:      string
  key?:         any
  ref?:         any
  props:        any
  renderOutput: any
  instance:     ReactInstance // this can be rendered with renderInstance
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

export type HtmlComponent
  = RenderedHtmlComponent
  | ArtificialHtmlComponent;

export interface RenderNew {
  (instance?:ReactInstance):RenderedComponent
}

// === Type guards ========================================================== //

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
