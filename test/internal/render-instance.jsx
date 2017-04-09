const React = require('react');
import renderInstance from '../render-instance';
import { isHtml, isUnknown } from '../types';

const WithChildren = ({ child }) => <div>{child}</div>;

describe('createComponent', () => {
  it('should load numeric children', () => {
    const renderedComponent = renderInstance(<WithChildren child={1}/>);
    expect(isHtml(renderedComponent)).toBe(true);

    const { children } = renderedComponent;
    expect(children.length).toBe(1);

    expect(isUnknown(children[0])).toBe(true);
  });
});
