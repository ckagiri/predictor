import get from 'lodash/get';
import { useMemo } from 'react';
import {
  getIds,
  getTotal,
  nameRelatedTo,
} from '../reducer/references/oneToMany';
import { CRUD_GET_MANY_REFERENCE } from '../actions/dataActions';
import useQueryWithStore from './useQueryWithStore';

const defaultPagination = {};
const defaultSort = {};
const defaultFilter = {};
const defaultIds = [];
const defaultData = {};

/**
 * Call the dataProvider.getManyReference() method and return the resolved result
 * as well as the loading state.
 *
 * The return value updates according to the request state:
 *
 * - start: { loading: true, loaded: false }
 * - success: { data: [data from store], ids: [ids from response], total: [total from response], loading: false, loaded: true }
 * - error: { error: [error from response], loading: false, loaded: false }
 *
 * This hook will return the cached result when called a second time
 * with the same parameters, until the response arrives.
 *
 * @param {string} resource The referenced resource name, e.g. 'comments'
 * @param {string} resourcePath The referenced resource api path e.g. '/posts/2/comments'
 * @param {string} referencingResource The resource name, e.g. 'posts'. Used to generate a cache key
 * @param {Object} id The identifier of the record to look for. Used to generate a cache key
 * @param {Object} options Options object to pass to the dataProvider.
 * @param {boolean} options.enabled Flag to conditionally run the query. If it's false, the query will not run
 * @param {Function} options.onSuccess Side effect function to be executed upon success, e.g. { onSuccess: { refresh: true } }
 * @param {Function} options.onFailure Side effect function to be executed upon failure, e.g. { onFailure: error => notify(error.message) }
 *
 * @returns The current request state. Destructure as { data, total, ids, error, loading, loaded }.
 *
 */

const useGetManyReference = ({
  resource,
  resourcePath,
  referencingResource,
  id,
  pagination = defaultPagination,
  sort = defaultSort,
  filter = defaultFilter,
  options,
}) => {
  const relatedTo = useMemo(
    () => nameRelatedTo(resource, referencingResource, id),
    [filter, resource, referencingResource, id],
  );

  const {
    data: { ids, allRecords },
    total,
    error,
    loading,
    loaded,
  } = useQueryWithStore(
    {
      type: 'getManyReference',
      resource,
      resourcePath,
      payload: { pagination, sort, filter },
    },
    { ...options, relatedTo, action: CRUD_GET_MANY_REFERENCE },
    // ids and data selector
    state => ({
      ids: getIds(state, relatedTo),
      allRecords: get(state.resources, [resource, 'data'], defaultData),
    }),
    state => getTotal(state, relatedTo),
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

export default useGetManyReference;
