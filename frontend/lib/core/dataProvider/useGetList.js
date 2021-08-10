import { useMemo } from 'react';
import get from 'lodash/get';

import { CRUD_GET_LIST } from '../actions/dataActions';
import useQueryWithStore from './useQueryWithStore';

const defaultPagination = {};
const defaultSort = {};
const defaultFilter = {};
const defaultIds = [];
const defaultData = {};

/**
 * Call the dataProvider.getList() method and return the resolved result
 * as well as the loading state.
 *
 * The return value updates according to the request state:
 *
 * - start: { loading: true, loaded: false }
 * - success: { data: [data from store], ids: [ids from response], total: [total from response], loading: false, loaded: true }
 * - error: { error: [error from response], loading: false, loaded: true }
 *
 * This hook will return the cached result when called a second time
 * with the same parameters, until the response arrives.
 *
 * @param {string} resource The resource name, e.g. 'posts'
 * @param {string} resourcePath The api path to the resource e.g. '/posts'
 * @param {Object} options Options object to pass to the dataProvider. May include side effects to be executed upon success of failure, e.g. { onSuccess: { refresh: true } }
 *
 * @returns The current request state. Destructure as { data, total, ids, error, loading, loaded }.
 *
 */

const useGetList = ({
  resource,
  resourcePath,
  pagination = defaultPagination,
  sort = defaultSort,
  filter = defaultFilter,
  options,
}) => {
  const {
    data: { ids, allRecords },
    total,
    error,
    loading,
    loaded,
  } = useQueryWithStore(
    {
      type: 'getList',
      resource,
      resourcePath,
      payload: { pagination, sort, filter },
    },
    { ...options, action: CRUD_GET_LIST },
    // // ids and data selector
    state => ({
      ids: get(state.resources, [resource, 'list', 'ids'], null),
      allRecords: get(state.resources, [resource, 'data'], defaultData),
    }),
    // total selector (may return undefined)
    state => get(state.resources, [resource, 'list', 'total']),
    isDataLoaded,
  );

  const data = useMemo(
    () =>
      ids === null
        ? defaultData
        : ids
            .map(id => allRecords[id])
            .reduce((acc, record) => {
              if (!record) return acc;
              acc[record.id] = record;
              return acc;
            }, {}),
    [ids, allRecords],
  );

  return {
    data,
    ids: ids === null ? defaultIds : ids,
    total,
    error,
    loading,
    loaded,
  };
};

const isDataLoaded = data => data.ids !== null;

export default useGetList;
