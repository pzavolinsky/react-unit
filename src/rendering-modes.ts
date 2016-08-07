import { UnitComponent, OptionalUnitComponent, ComponentConstructor
  , ReactElement, CreateComponent
  } from './types';
import { mapComponent } from './mapping';
import renderElement from './render-element';

// createComponent :: CreateFn
//   :: WrapFn -- (UnitComponent -> ReactComponent -> UnitComponent)
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
export const createComponent = (
  compCtor:ComponentConstructor,
  parent:OptionalUnitComponent,
  reactElement:ReactElement) => {
  const mapper = mapComponent(compCtor, parent);
  return renderElement(mapper, reactElement);
};

// Default behavior: recursively call create component
// createComponentDeep
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
export function createComponentDeep(createComponentFn:CreateComponent) {
  return (parent:OptionalUnitComponent, element:ReactElement):UnitComponent =>
    createComponentFn(createComponentDeep(createComponentFn), parent, element);
}

// Only process a single level of react components (honoring all the HTML
// in-between).
// createComponentShallow
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
const createShallowElement = (
  parent:OptionalUnitComponent,
  element:ReactElement
) => {
  const comp = new UnitComponent(element, parent);
  comp.componentInstance = element;
  return comp;
};
export function createComponentShallow(createComponentFn:CreateComponent) {
  return (parent:OptionalUnitComponent, element:ReactElement) =>
    createComponentFn(createShallowElement, parent, element);
}

// Same as createComponentDeep but interleaves <MyComponent> tags, rendering
// a pseudo-html that includes both react components and actual HTML output.
// createComponentInterleaved
//   :: CreateFn
//   -> UnitComponent
//   -> ReactElement
//   -> UnitComponent
export function createComponentInterleaved(createComponentFn:CreateComponent) {
  // Ctor1 -> (Comp1 -> Ctor1 -> Comp2) -> Comp1
  function create(
    createRealComponent:(
      artificialParent:UnitComponent,
      element:ReactElement
    ) => UnitComponent,
    parent:OptionalUnitComponent,
    el:ReactElement
  ):UnitComponent {
    const artificialParent = createShallowElement(parent, el);
    const realComponent = createRealComponent(artificialParent, el);
    artificialParent.props.children = realComponent;
    artificialParent.renderNew = (newElement:ReactElement = el) => create(
      (newParent) => {
        // this implementation of createRealComponent actually updates the
        // component by calling renderNew:
        const newComponent = realComponent.renderNew(newElement);
        newComponent.parentNode = newParent;
        return newComponent;
      },
      parent,
      newElement
    );
    return artificialParent;
  }

  const createRealComponent = (
    artificialParent:UnitComponent,
    element:ReactElement
  ):UnitComponent => createComponentFn(
    createComponentInterleaved(createComponentFn),
    artificialParent,
    element);

  return (parent:OptionalUnitComponent, element:ReactElement):UnitComponent =>
    create(createRealComponent, parent, element);
};
