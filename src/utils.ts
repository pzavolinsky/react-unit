import { contains, merge } from 'ramda';
import { isElementOfType } from 'react-dom/test-utils';
import
  { RenderedComponent
  , isHtml
  , isShallow
  } from './types';
const notText = ['object', 'function'];

export const isText = (v:any):v is string => !contains(typeof v, notText);

export const isOfType = (type:any, comp:RenderedComponent):boolean =>
  (isHtml(comp) || isShallow(comp)) && isElementOfType(comp.instance, type);

export const getTagNameForType = (type:any) =>
  type.displayName || type.name || 'anonymous-component';

export function filterChildren(
  fn:(c:RenderedComponent) => boolean,
  comp:RenderedComponent
):RenderedComponent {
  return isHtml(comp)
    ? merge(comp, {
        children: comp.children.filter(fn).map(c => filterChildren(fn, c))
      })
    : comp;
}
