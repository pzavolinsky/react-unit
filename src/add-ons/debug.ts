import { compose, merge } from 'ramda';
import
  { AddOn
  , InstanceMapper
  , ComponentMapper
  , ResolvedMapper
  , RenderContext
  } from '../types';

const instanceLogger:InstanceMapper = instance => {
  console.log('[instance]', instance);
  return instance;
};

const componentLogger:ComponentMapper = comp => {
  console.log('[component]', comp);
  return comp;
};

const resolveLogger:ResolvedMapper = comp => {
  console.log('[resolved]', comp);
  return comp;
};

const debug:AddOn = (ctx:RenderContext) => ():RenderContext =>
  merge(ctx, {
    instanceMapper: compose(instanceLogger, ctx.instanceMapper),
    componentMapper: compose(componentLogger, ctx.componentMapper),
    resolveMapper: compose(resolveLogger, ctx.resolveMapper)
  });

export default debug;
