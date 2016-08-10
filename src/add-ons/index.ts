import { AddOn } from '../types';
import exclude from './exclude';
import mock from './mock';
import withContext from './with-context';

interface AddOnMap {
  [name:string]:AddOn
}

const addOns:AddOnMap = {
  exclude,
  mock,
  withContext
};

export default addOns;
