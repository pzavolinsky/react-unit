import { compose, merge } from 'ramda';
import
  { AddOn
  , ComponentMapper
  , RenderContext
  , RenderedComponent
  , isShallow
  } from '../types';
import { isOfType, getTagNameForType } from '../utils';

const mockMapper = (actual:any, mock:any):ComponentMapper =>
  (comp:RenderedComponent) =>
    isShallow(comp) && isOfType(actual, comp)
    ? { type: 'shallow'
      , tagName: getTagNameForType(mock)
      , instance: merge(comp.instance, { type: mock })
      }
    : comp;

const mock:AddOn = (ctx:RenderContext) =>
  (actual:any, mock:any):RenderContext => merge(ctx, {
    componentMapper: compose(mockMapper(actual, mock), ctx.componentMapper)
  });

export default mock;
