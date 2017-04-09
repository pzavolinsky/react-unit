import { Children } from 'react';
import { mergeAll } from 'ramda';
import ReactShallowRenderer = require('react-test-renderer/shallow');
import
  { ReactInstance
  , RenderedComponent
  , ShallowReactComponent
  , RenderedHtmlComponent
  , ArtificialHtmlComponent
  , RenderedUnknownComponent
  , RenderNew
  , isHtml
  } from './types';
import { getTagNameForType } from './utils';

// --- Rendered Component Wrapper Functions --------------------------------- //
function wrapShallowReactComponent(
  renderOutput:any
):ShallowReactComponent {
  const { type } = renderOutput;
  const tagName = getTagNameForType(type);
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
  instance:ReactInstance
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
  tagName:      getTagNameForType(comp.instance.type),
  props:        getPropsForOutput(comp.instance),
  renderOutput: comp.instance,
  instance:     comp.instance,
  children:     child ? [child] : [],
  renderNew:    child && isHtml(child) ? child.renderNew : undefined
});

const renderInstance = (instance:ReactInstance):RenderedComponent => {

  const shallowRenderer = new ReactShallowRenderer();

  function create(componentInstance:ReactInstance):RenderedComponent {

    shallowRenderer.render(componentInstance, componentInstance.context);

    const renderOutput = shallowRenderer.getRenderOutput();
    const renderNew = (newInstance?:ReactInstance) =>
      create(newInstance || componentInstance);

    return processRenderOutput(renderNew, renderOutput, componentInstance);
  }
  return create(instance);
};

export default renderInstance;
