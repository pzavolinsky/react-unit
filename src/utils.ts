import * as R from 'ramda';

const notText = ['object', 'function'];

export const isText = (v:any):v is string => !R.contains(typeof v, notText);
