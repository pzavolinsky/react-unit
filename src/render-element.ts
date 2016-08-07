import { createRenderer } from 'react-addons-test-utils';
import { ReactElement, ComponentMapper } from './types';

// renderElement
//   :: (ReactComponent -> UnitComponent)
//   -> ReactElement
//   -> UnitComponent
const renderElement = (mapper:ComponentMapper, reactElement:ReactElement) => {
  const shallowRenderer = createRenderer();
  function create(reactElement:any) {
    shallowRenderer.render(reactElement, reactElement.context);
    const reactComponent = shallowRenderer.getRenderOutput();
    if (!reactComponent) return reactComponent; // null, undef, 0, '', etc.
    const unitComponent = mapper(reactComponent);
    unitComponent.originalComponentInstance = reactElement;
    unitComponent.renderNew = newElement => create(newElement || reactElement);
    return unitComponent;
  }
  return create(reactElement);
};

export default renderElement;
