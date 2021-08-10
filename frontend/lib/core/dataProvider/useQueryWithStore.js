import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';

import useDataProvider from './useDataProvider';
import { useSafeSetState } from '../util/hooks';

const defaultIsDataLoaded = data => data !== undefined;

/**
 * Fetch the data provider through Redux, return the value from the store.
 *
 * The return value updates according to the request state:
 *
 * - start: { loading: true, loaded: false }
 * - success: { data: [data from response], total: [total from response], loading: false, loaded: true }
 * - error: { error: [error from response], loading: false, loaded: true }
 *
 * This hook will return the cached result when called a second time
 * with the same parameters, until the response arrives.
 *
 * @param {Object} query
 * @param {string} query.type The verb passed to the data provider, e.g. 'getList', 'getOne'
 * @param {string} query.resource A resource name, e.g. 'posts', 'comments'
 * @param {string} query.resourcePath The api path to the resource, e.g. '/posts', '/comments'
 * @param {Object} query.payload The payload object, e.g; { post_id: 12 }
 * @param {Object} options
 * @param {string} options.action Redux action type
 * @param {boolean} options.enabled Flag to conditionally run the query. If it's false, the query will not run
 * @param {Function} options.onSuccess Side effect function to be executed upon success of failure, e.g. { onSuccess: response => refresh() } }
 * @param {Function} options.onFailure Side effect function to be executed upon failure, e.g. { onFailure: error => notify(error.message) } }
 * @param {function} dataSelector Redux selector to get the result. Required.
 * @param {function} totalSelector Redux selector to get the total (optional, only for LIST queries)
 * @param {Function} isDataLoaded

 *
 * @returns The current request state. Destructure as { data, total, error, loading, loaded }.
 *
 * @example
 *
 * const UserProfile = ({ record }) => {
 *     const { data, loading, error } = useQueryWithStore(
 *         {
 *             type: 'getOne',
 *             resource: 'users',
 *             resourcePath: '/users',
 *             payload: { id: record.id }
 *         },
 *         {},
 *         state => state.resources.users.data[record.id]
 *     );
 *     if (loading) { return <Loading />; }
 *     if (error) { return <p>ERROR</p>; }
 *     return <div>User {data.username}</div>;
 * };
 */

const useQueryWithStore = (
  query,
  options,
  dataSelector,
  totalSelector,
  isDataLoaded = defaultIsDataLoaded,
) => {
  const { type, resource, resourcePath, payload } = query;
  const requestSignature = JSON.stringify({
    query,
    options,
  });
  const requestSignatureRef = useRef(requestSignature);
  const data = useSelector(dataSelector);
  const total = useSelector(totalSelector);

  const [state, setState] = useSafeSetState({
    data,
    total,
    error: null,
    loading: options.enabled === false ? false : true,
    loaded: options.enabled === false ? false : isDataLoaded(data),
  });
  if (!isEqual(state.data, data) || state.total !== total) {
    // the dataProvider response arrived in the Redux store
    setState({
      ...state,
      data,
      total,
      loaded: true,
    });
  }
  useEffect(() => {
    if (requestSignatureRef.current !== requestSignature) {
      // request has changed, reset the loading state
      requestSignatureRef.current = requestSignature;
      setState({
        data,
        total,
        error: null,
        loading: options.enabled === false ? false : true,
        loaded: options.enabled === false ? false : isDataLoaded(data),
      });
    } else if (!isEqual(state.data, data) || state.total !== total) {
      // the dataProvider response arrived in the Redux store
      if (typeof total !== 'undefined' && isNaN(total)) {
        console.error(
          'Total from response is not a number. Please check your dataProvider or the API.',
        );
      } else {
        setState(prevState => ({
          ...prevState,
          data,
          total,
          loaded: true,
          loading: false,
        }));
      }
    }
  }, [
    data,
    requestSignature,
    setState,
    state.data,
    state.total,
    total,
    isDataLoaded,
    options.enabled,
  ]);

  const dataProvider = useDataProvider();
  useEffect(() => {
    const queryPromise = new Promise(resolve => {
      dataProvider[type](resource, resourcePath, payload, options)
        .then(() => {
          // We don't care about the dataProvider response here, because
          // it was already passed to SUCCESS reducers by the dataProvider
          // hook, and the result is available from the Redux store
          // through the data and total selectors.
          // In addition, if the query is optimistic, the response
          // will be empty, so it should not be used at all.
          if (requestSignature !== requestSignatureRef.current) {
            resolve(undefined);
          }
          resolve({
            error: null,
            loading: false,
            loaded: options.enabled === false ? false : true,
          });
        })
        .catch(error => {
          if (requestSignature !== requestSignatureRef.current) {
            resolve(undefined);
          }
          resolve({
            error,
            loading: false,
            loaded: false,
          });
        });
    });

    (async () => {
      const newState = await queryPromise;
      if (newState) setState(state => ({ ...state, ...newState }));
    })();
  }, [requestSignature]); // eslint-disable-line

  return state;
};

export default useQueryWithStore;
