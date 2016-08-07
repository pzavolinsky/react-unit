import { Children } from 'react';
import { isNil } from 'ramda';
import { ComponentMapper, UnitComponent, OptionalUnitComponent
  , ComponentConstructor
  } from './types';
import { isText } from './utils';

// --- Mapping -------------------------------------------------------------- //
// mapChildren
//   :: (ReactElement | ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> { children :: [ UnitComponent ]
//      , texts :: [ String ]
//      }
const mapChildren = (mapFn:ComponentMapper, comp:UnitComponent) => {
  let children:UnitComponent[] = [];
  let texts:string[] = [];

  Children.forEach(comp.props.children,
    c => {
      if (isText(c)) texts.push(c);
      else if (c) {
        const childComp = mapFn(c);
        if (childComp !== null && childComp !== undefined) {
          children.push(childComp);
          if (childComp) {
            texts = texts.concat(childComp.texts);
          }
        }
      }
  });

  return {
    children: children.length == 1 && !isNil(children[0])
      ? children[0]
      : children,
    texts
  };
};

// mapComponent
//   :: (UnitComponent -> ReactElement -> UnitComponent) -- WrapFn
//   -> UnitComponent
//   -> ReactElement | ReactComponent
//   -> UnitComponent
export function mapComponent(
  compCtor:ComponentConstructor,
  parent:OptionalUnitComponent
) {
  return (item:any) => {
    if (typeof item.type === 'function') {
      // item is a ReactElement that we need to render into a UnitComponent
      return compCtor(parent, item);
    }

    // item is ReactComponent that we can wrap in a UnitComponent and process
    // its children.
    const unitComponent = new UnitComponent(item, parent);

    if (!unitComponent.props) return unitComponent;

    const oldChildren = unitComponent.props.children;
    if (!oldChildren || oldChildren.length === 0) return unitComponent;

    const mapFn = mapComponent(compCtor, unitComponent);
    const mappedChildren = mapChildren(mapFn, unitComponent);
    unitComponent.props.children = mappedChildren.children;
    unitComponent.texts = mappedChildren.texts;
    unitComponent.text = unitComponent.texts.join('');
    return unitComponent;
  };
}
