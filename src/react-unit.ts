import * as R from 'ramda';
import { UnitComponent } from './unit-component';
import
  { isUnknown
  , RenderContext
  , Resolver
  , ResolvedComponent
  , AddOn
  , defaultRenderContext
  } from './types';
import
  { deepResolver
  , shallowResolver
  , interleavedResolver
  } from './resolver';
import { applyRootPipeline, applyComponentPipeline } from './pipeline';
import wrapper from './wrapper';
import addOns from './add-ons';

interface CreateComponentFn {
  (instance:any):UnitComponent|any
}

interface CreateComponent extends CreateComponentFn {
  shallow: CreateComponentFn
  interleaved: CreateComponentFn
  ctx: RenderContext
}

const createComponent = (
  ctx:RenderContext,
  resolver:Resolver
):(instance:any) => UnitComponent|any => {
  const rootPipeline = applyRootPipeline(ctx, resolver);
  const componentPipeline = applyComponentPipeline(ctx, resolver);
  function wrap(resolved:ResolvedComponent):UnitComponent|any {
    return isUnknown(resolved)
      ?  resolved.unknown
      :  wrapper(undefined, resolved, c => i => wrap(componentPipeline(c)(i)));
  }
  return R.compose(wrap, rootPipeline);
};

const makeCreateComponent = (ctx:RenderContext) => {
  const fn:CreateComponent = createComponent(ctx, deepResolver) as any;
  fn.shallow = createComponent(ctx, shallowResolver);
  fn.interleaved = createComponent(ctx, interleavedResolver);
  fn.ctx = ctx;
  return fn;
};

function applyAddons(fn:CreateComponent) {
  R.toPairs<string, AddOn>(addOns).forEach(([name, addOn]) => {
    (fn as any)[name] =
      R.compose(applyAddons, makeCreateComponent, addOn(fn.ctx));
  });
  return fn;
};

export = applyAddons(makeCreateComponent(defaultRenderContext));
