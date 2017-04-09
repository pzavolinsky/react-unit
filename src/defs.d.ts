declare module "react-test-renderer/shallow" {
  class ReactShallowRenderer {
    render(instance:any, ctx:any) : void;
    getRenderOutput() : any;
  }

  export = ReactShallowRenderer;
}

declare module "react-dom/test-utils" {
  export function isElementOfType(instance:any, type:any) : boolean;
}

interface Array<T> {
    filter<U extends T>(pred:(a:T) => a is U):U[];
}
