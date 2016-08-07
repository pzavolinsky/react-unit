import * as R from 'ramda';
import
  { CreateComponent
  , ComponentConstructor
  , ReactElement
  , ElementType
  , ExportedCreateComponent
  , OptionalUnitComponent
  } from './types';
import
  { createComponent
  , createComponentDeep
  , createComponentShallow
  , createComponentInterleaved
  } from './rendering-modes';

const makeCreateComponent = (create:CreateComponent) => {
  const fn:ExportedCreateComponent =
    el => createComponentDeep(create)(undefined, el);
  fn.create = create;
  fn.shallow = el => createComponentShallow(create)(undefined, el);
  fn.interleaved = el => createComponentInterleaved(create)(undefined, el);
  return fn;
};

const exportedFn = makeCreateComponent(createComponent);

// --- Add-ons -------------------------------------------------------------- //
// Note: an add-on is a function that takes a CreateComponent, then any args
// you want and returns a new CreateComponent:
//
type AddOn = (create:CreateComponent) =>
  (...args:any[]) =>
    CreateComponent;

const exclude:AddOn = (create:CreateComponent) =>
  (exclude:ElementType[]|ElementType) =>  {
    const isBlacklisted:(el:ReactElement) => boolean =
      exclude.constructor === Array
      ? el => R.contains(el.type, exclude as ElementType[])
      : el => el.type == exclude;

    return (
      compCtor:ComponentConstructor,
      parent:OptionalUnitComponent,
      element:ReactElement
    ) =>
        isBlacklisted(element)
        ? null as any // TODO: extend type interface
        : create(compCtor, parent, element);
};

const mock:AddOn = (create:CreateComponent) =>
  (actual:ElementType, mock:ElementType) => (
    compCtor:ComponentConstructor,
    parent:OptionalUnitComponent,
    element:ReactElement
  ) =>
    create(
      compCtor,
      parent,
      element.type != actual
      ? element
      : R.merge(element, { type: mock })
    );

const withContext:AddOn = (create:CreateComponent) =>
  (context:any) => (
    compCtor:ComponentConstructor,
    parent:OptionalUnitComponent,
    element:ReactElement
  ) =>
    create(
      compCtor,
      parent,
      R.merge(element, { context })
    );

const addons:{ [index:string]:AddOn } = {
  exclude,
  mock,
  withContext
};

function applyAddons(fn:any) {
  R.compose(
    R.forEach(([k, f]:any) => {
      fn[k] = R.compose(applyAddons, makeCreateComponent, f(fn.create));
    }),
    R.toPairs
  )(addons);
  return fn;
};

export = applyAddons(exportedFn);
