import { useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import DataProviderContext from './DataProviderContext';
import validateResponseFormat from './validateResponseFormat';
import getFetchType from './getFetchType';
import { FETCH_END, FETCH_ERROR, FETCH_START } from '../actions/fetchActions';

/**
 * Hook for getting a dataProvider
 *
 * Gets a dataProvider object, which behaves just like the real dataProvider
 * (same methods returning a Promise). But it's actually a Proxy object, which
 * dispatches Redux actions along the process. The benefit is that react-admin
 * tracks the loading state when using this hook, and stores results in the
 * Redux store for future use.
 *
 */

const useDataProvider = () => {
  const dispatch = useDispatch();
  const dataProvider = useContext(DataProviderContext);

  const dataProviderProxy = useMemo(() => {
    return new Proxy(dataProvider, {
      get: (target, name) => {
        if (typeof name === 'symbol') {
          return;
        }
        return (resource, resourcePath, payload, options) => {
          const type = name.toString();
          const {
            action = 'CUSTOM_FETCH',
            onSuccess = undefined,
            onFailure = undefined,
            enabled = true,
            ...rest
          } = options || {};

          if (typeof dataProvider[type] !== 'function') {
            throw new Error(`Unknown dataProvider function: ${type}`);
          }
          if (onSuccess && typeof onSuccess !== 'function') {
            throw new Error('The onSuccess option must be a function');
          }
          if (onFailure && typeof onFailure !== 'function') {
            throw new Error('The onFailure option must be a function');
          }
          if (typeof enabled !== 'boolean') {
            throw new Error('The enabled option must be a boolean');
          }

          if (enabled === false) {
            return Promise.resolve({});
          }

          const params = {
            resource,
            resourcePath,
            type,
            payload,
            action,
            onFailure,
            onSuccess,
            rest,
            dataProvider,
            dispatch,
          };
          return performQuery(params);
        };
      },
    });
  }, [dataProvider, dispatch]);

  return dataProviderProxy;
};

/**
 * In normal mode, the hook calls the dataProvider. When a successful response
 * arrives, the hook dispatches a SUCCESS action, executes success side effects
 * and returns the response. If the response is an error, the hook dispatches
 * a FAILURE action, executes failure side effects, and throws an error.
 */
const performQuery = ({
  type,
  payload,
  resource,
  resourcePath,
  action,
  rest,
  onSuccess,
  onFailure,
  dataProvider,
  dispatch,
}) => {
  dispatch({
    type: action,
    payload,
    meta: { resource, ...rest },
  });
  dispatch({
    type: `${action}_LOADING`,
    payload,
    meta: { resource, ...rest },
  });
  dispatch({ type: FETCH_START });

  try {
    return dataProvider[type]
      .apply(dataProvider, [resourcePath, payload])
      .then(response => {
        if (process.env.NODE_ENV !== 'production') {
          validateResponseFormat(response, type);
        }
        dispatch({
          type: `${action}_SUCCESS`,
          payload: response,
          requestPayload: payload,
          meta: {
            ...rest,
            resource,
            fetchResponse: getFetchType(type),
            fetchStatus: FETCH_END,
          },
        });
        dispatch({ type: FETCH_END });
        onSuccess && onSuccess(response);
        return response;
      })
      .catch(error => {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }
        dispatch({
          type: `${action}_FAILURE`,
          error: error.message ? error.message : error,
          payload: error.body ? error.body : null,
          requestPayload: payload,
          meta: {
            ...rest,
            resource,
            fetchResponse: getFetchType(type),
            fetchStatus: FETCH_ERROR,
          },
        });
        dispatch({ type: FETCH_ERROR, error });
        onFailure && onFailure(error);
        throw error;
      });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    throw new Error(
      'The dataProvider threw an error. It should return a rejected Promise instead.',
    );
  }
};

export default useDataProvider;
