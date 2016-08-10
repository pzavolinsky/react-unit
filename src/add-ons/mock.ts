import { compose, merge } from 'ramda';
import { AddOn, InstanceMapper, RenderContext } from '../types';

const mockMapper = (actual:any, mock:any):InstanceMapper => {
  return (instance:any) =>
    instance.type == actual
    ? merge(instance, { type: mock })
    : instance;
};
const mock:AddOn = (ctx:RenderContext) =>
  (actual:any, mock:any):RenderContext => merge(ctx, {
    instanceMapper: compose(mockMapper(actual, mock), ctx.instanceMapper)
  });

export default mock;
