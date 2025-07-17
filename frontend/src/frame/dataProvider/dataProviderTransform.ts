import { DataProvider, DataProviderFn } from '../types';
import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_ONE,
  UPDATE,
  UPDATE_MANY,
} from './dataFetchActions';
import { defaultDataProvider } from './defaultDataProvider';

const fetchMap: { [key: string]: any } = {
  create: CREATE,
  delete: DELETE,
  deleteMany: DELETE_MANY,
  getList: GET_LIST,
  getMany: GET_MANY,
  getOne: GET_ONE,
  update: UPDATE,
  updateMany: UPDATE_MANY,
};

const dataProviderTransform = (
  dataProviderFn: DataProviderFn
): DataProvider => {
  const proxy = new Proxy(defaultDataProvider, {
    get(_, name) {
      return (resource: string, params: any) => {
        if (Object.keys(fetchMap).includes(name.toString())) {
          const fetchType = fetchMap[name.toString()] as any;
          return dataProviderFn(fetchType, resource, params);
        }

        return dataProviderFn(name.toString(), resource, params);
      };
    },
    apply(_, __, args) {
      return dataProviderFn.apply(dataProviderFn, args as any);
    },
  });

  return proxy as any;
};

export default dataProviderTransform;
