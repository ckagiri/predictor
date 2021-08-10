import checkMinimumRequiredProps from './checkMinimumRequiredProps';
import { CRUD_GET_MANY_REFERENCE } from '../actions';
import useGetManyReference from '../dataProvider/useGetManyReference';

/**
 * Prepare data for the List view
 *
 * @param {Object} props The props passed to the List component.
 *
 * @return {Object} controllerProps Fetched and computed data for the List view
 *
 */

const useReferenceListController = props => {
  checkMinimumRequiredProps(
    'ReferenceList',
    ['basePath', 'resource', 'resourcePath', 'referencingResource', 'id'],
    props,
  );

  const { basePath, resource, resourcePath, referencingResource, id } = props;

  /**
   * We want the list of ids to be always available for optimistic rendering,
   * and therefore we need a custom action (CRUD_GET_MANY_REFERENCE) that will be used.
   */
  const { ids, data, total, error, loading, loaded } = useGetManyReference({
    resource,
    resourcePath,
    referencingResource,
    id,
    options: {
      onFailure: error =>
        console.error(
          typeof error === 'string'
            ? error
            : error.message || 'Server communication error',
          'warning',
        ),
    },
  });

  return {
    basePath,
    data,
    error,
    ids,
    loaded: loaded || ids.length > 0,
    loading,
    resource,
    resourcePath,
    total,
  };
};

export const injectedProps = [
  'basePath',
  'data',
  'error',
  'ids',
  'loading',
  'loaded',
  'resource',
  'resourcePath',
  'total',
];

/**
 * Select the props injected by the useReferenceListController hook
 * to be passed to the List children need
 * This is an implementation of pick()
 */
export const getListControllerProps = props =>
  injectedProps.reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

/**
 * Select the props not injected by the useReferenceListController hook
 * to be used inside the List children to sanitize props injected by List
 * This is an implementation of omit()
 */
export const sanitizeListRestProps = props =>
  Object.keys(props)
    .filter(propName => !injectedProps.includes(propName))
    .reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

export default useReferenceListController;
