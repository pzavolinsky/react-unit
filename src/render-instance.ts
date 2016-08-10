import { Children } from 'react';
import { mergeAll } from 'ramda';
import { createRenderer } from 'react-addons-test-utils';
import
  { RenderedComponent
  , ShallowReactComponent
  , RenderedHtmlComponent
  , ArtificialHtmlComponent
  , RenderedUnknownComponent
  , RenderNew
  , isHtml
  } from './types';

// --- Rendered Component Wrapper Functions --------------------------------- //
function wrapShallowReactComponent(
  renderOutput:any
):ShallowReactComponent {
  const { type } = renderOutput;
  const tagName = type.displayName || type.name || 'anonymous-component';
  return {
    type: 'shallow',
    tagName,
    instance: renderOutput
  };
};

const getPropsForOutput = (
  { key
  , ref
  , props
  , _store // tslint:disable-line
  }:any
) => mergeAll([
  _store && _store.props,
  props,
  { key, ref }
]) as any;

function wrapHtmlComponent(
  renderNew:RenderNew,
  renderOutput:any,
  instance:any
):RenderedHtmlComponent {
  const { type, key, ref } = renderOutput;
  const props = getPropsForOutput(renderOutput);

  const children:RenderedComponent[] =
    props.children
    ? Children.map(
        props.children,
        c => processRenderOutput(renderNew, c, c)
      )
    : [];

  return {
    type: 'html',
    tagName: type,
    key,
    ref,
    props: props,
    renderOutput,
    instance,
    children,
    renderNew
  };
};

function wrapUnknownComponent(
  renderOutput:any
):RenderedUnknownComponent {
  return {
    type: 'unknown',
    unknown: renderOutput
  };
}

function processRenderOutput(
  renderNew:RenderNew,
  renderOutput:any,
  instance:any
):RenderedComponent {
  if (!renderOutput) {
    // e.g. render() { return undefined; }
    return wrapUnknownComponent(renderOutput);
  }

  if (typeof renderOutput.type === 'function') {
    // shallowRender reached another React component and stopped
    // renderOutput is the spec for that (child) component
    return wrapShallowReactComponent(renderOutput);
  }

  if (renderOutput.type && renderOutput.props) {
    // shallowRender returned an HTML component
    return wrapHtmlComponent(renderNew, renderOutput, instance);
  }

  return wrapUnknownComponent(renderOutput);
}

// --- Public API ----------------------------------------------------------- //
export const toArtificialHtml = (
  comp:ShallowReactComponent|RenderedHtmlComponent,
  child?:RenderedComponent
):ArtificialHtmlComponent => ({
  type:         'artificial',
  tagName:      comp.instance.type.displayName || comp.instance.type.name,
  props:        getPropsForOutput(comp.instance),
  renderOutput: comp.instance,
  instance:     comp.instance,
  children:     child ? [child] : [],
  renderNew:    child && isHtml(child) ? child.renderNew : undefined
});

const renderInstance = (instance:any):RenderedComponent => {
  const shallowRenderer = createRenderer();
  function create(componentInstance:any):RenderedComponent {
    shallowRenderer.render(componentInstance, componentInstance.context);
    const renderOutput = shallowRenderer.getRenderOutput();
    const renderNew = (newInstance:any) =>
      create(newInstance || componentInstance);
    return processRenderOutput(renderNew, renderOutput, componentInstance);
  }
  return create(instance);
};

export default renderInstance;
