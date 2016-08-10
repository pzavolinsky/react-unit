import { compose } from 'ramda';
import
  { RenderContext
  , Resolver
  , HtmlComponent
  } from './types';
import renderInstance from './render-instance';

const resolveAndMap = (ctx:RenderContext, resolver:Resolver) =>  {
  const mapAndRender = compose(renderInstance, ctx.instanceMapper);
  const resolve = resolver(ctx.componentMapper, mapAndRender);
  return compose(
    // 4) MAP the ResolvedComponent (optional).
    ctx.resolveMapper,

    // 3) RESOLVE the RenderedComponent into ResolvedComponent by applying a
    //    resolve strategy (deep, shallow, interleaved). The result replaces
    //    ShallowReactComponents with either a unknown components or HTML
    //    components. The resolution process applies a ComponentMapper to each
    //    RenderedComponent before resolving.
    resolve
  );
};

export const applyRootPipeline = (ctx:RenderContext, resolver:Resolver) =>
  compose(
    resolveAndMap(ctx, resolver),

    // 2) RENDER the React INSTANCE into a RenderedComponent (renderInstance)
    //    Note: at this stage, the RenderedComponent tree includes
    //    not-yet-rendered ShallowReactComponents.
    renderInstance,

    // 1) MAP the React INSTANCE (optional).
    ctx.instanceMapper
  );

const failShallowArtificial = (comp:HtmlComponent) =>
  (instance:any) => {
    throw `
      Cannot call renderNew on shallow rendered component ${comp.tagName}.

      Looks like you are trying test <Parent><Stateful /></Parent> using
      shallow render.

      Consider using another rendering mode (e.g. interleaved) or refactoring
      the test to do a shallow stateless test of <Parent /> and a shallow
      stateful test of <Stateful />;
    `;
  };

export const applyComponentPipeline = (ctx:RenderContext, resolver:Resolver) =>
  (comp:HtmlComponent) =>
    compose(
      resolveAndMap(ctx, resolver),

      // 2) RE-RENDER the React INSTANCE into a RenderedComponent (renderNew)
      //    Note: at this stage, the RenderedComponent tree includes
      //    not-yet-rendered ShallowReactComponents.
      comp.renderNew  || failShallowArtificial(comp),

      // 1) MAP the React INSTANCE (optional).
      ctx.instanceMapper
    );
