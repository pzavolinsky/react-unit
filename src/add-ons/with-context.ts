import { compose, merge } from 'ramda';
import { AddOn, InstanceMapper, RenderContext } from '../types';

const withContextMapper = (context:any):InstanceMapper =>
  (instance:any) => merge(instance, { context });

const withContext:AddOn = (ctx:RenderContext) =>
  (context:any):RenderContext => merge(ctx, {
    instanceMapper: compose(withContextMapper(context), ctx.instanceMapper)
  });

export default withContext;
