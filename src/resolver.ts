import { merge } from 'ramda';
import { toArtificialHtml } from './render-instance';
import
  { ComponentMapper
  , InstanceRenderer
  , RenderedComponent
  , ResolvedComponent
  , isHtml
  , isShallow
  } from './types';

export function deepResolver(
  mapper:ComponentMapper,
  renderer:InstanceRenderer
) {
  return (comp:RenderedComponent):ResolvedComponent => {
    const resolve = deepResolver(mapper, renderer);
    const mapped = mapper(comp);
    if (isShallow(mapped)) {
      const newComp = renderer(mapped.instance);
      // note that newComp might be shallow again, so we need to call
      // deepResolver on it to resolve the whole the tree
      return resolve(newComp);
    }
    if (isHtml(mapped)) return merge(mapped, {
      children: mapped.children.map(resolve)
    });
    return mapped;
  };
}

export function shallowResolver(
  mapper:ComponentMapper,
  _:InstanceRenderer
) {
  return (comp:RenderedComponent):ResolvedComponent => {
    const resolve = shallowResolver(mapper, _);
    const mapped = mapper(comp);
    if (isShallow(mapped)) {
      return toArtificialHtml(mapped);
    }
    if (isHtml(mapped)) {
      return merge(mapped, {
        children: mapped.children.map(resolve)
      });
    }
    return mapped;
  };
}

export function interleavedResolver(
  mapper:ComponentMapper,
  renderer:InstanceRenderer,
  nonRoot?:boolean
) {
  return (comp:RenderedComponent):ResolvedComponent => {
    const resolve = interleavedResolver(mapper, renderer, true);
    const mapped = mapper(comp);
    if (isShallow(mapped)) {
      const newComp = renderer(mapped.instance);
      // note that newComp might be shallow again, so we need to call
      // interleavedResolver on it to render the whole the tree
      const renderedComp = resolve(newComp);
      return toArtificialHtml(mapped, renderedComp);
    }

    if (isHtml(mapped)) {
      const mappedWithChildren = merge(mapped, {
        children: mapped.children.map(resolve)
      });

      return nonRoot
        ? mappedWithChildren
        : toArtificialHtml(mappedWithChildren, mappedWithChildren);
    }

    return mapped;
  };
}
