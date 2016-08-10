import { compose, merge, any } from 'ramda';
import
  { AddOn
  , RenderedComponent
  , RenderContext
  , ComponentMapper
  } from '../types';
import { isOfType, filterChildren } from '../utils';

const excludeMapper = (exclude:any[]|any):ComponentMapper => {
  const allowed:(comp:RenderedComponent) => boolean =
    exclude.constructor === Array
    ? comp => !any(t => isOfType(t, comp), exclude)
    : comp => !isOfType(exclude, comp);
  return comp => filterChildren(allowed, comp);
};

const exclude:AddOn = (ctx:RenderContext) =>
  (exclude:any[]|any):RenderContext => merge(ctx, {
    componentMapper: compose(excludeMapper(exclude), ctx.componentMapper)
  });

export default exclude;
