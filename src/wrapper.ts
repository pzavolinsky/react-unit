import
  { HtmlComponent
  , isHtml
  , isUnknown
  } from './types';
import
  { UnitComponent
  , OptionalUnitComponent
  , RenderNewUnit
  } from './unit-component';

function wrapRenderedIntoUnitComponent(
  parent:OptionalUnitComponent,
  htmlComponent:HtmlComponent,
  componentPipeline:(comp:HtmlComponent) => RenderNewUnit
):UnitComponent {
  const unitComponent = new UnitComponent(
    htmlComponent,
    parent,
    componentPipeline(htmlComponent)
  );

  let children:UnitComponent[] = [];
  let texts:string[] = [];

  htmlComponent.children.forEach(c => {
    if (isUnknown(c)) {
      const { unknown } = c;
      if (unknown !== undefined && unknown !== null) {
        texts.push(unknown.toString());
      }
    } else if (isHtml(c)) {
      const child = wrapRenderedIntoUnitComponent(
        unitComponent,
        c,
        componentPipeline
      );
      children.push(child);
      texts = texts.concat(child.texts);
    }
    // we ignore NotRenderedReactComponents
  });

  unitComponent.props.children = children;
  unitComponent.texts = texts;
  unitComponent.text = texts.join('');
  return unitComponent;
}

export default wrapRenderedIntoUnitComponent;
