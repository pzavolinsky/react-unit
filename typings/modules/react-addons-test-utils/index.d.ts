declare module 'react-addons-test-utils' {
  module TestUtils {
    export function createRenderer():{
        render: (comp:any, ctx:any) => void
        getRenderOutput: () => any
    }
    export function isElementOfType(a: any, b: any):boolean
  }

  export = TestUtils;
}
