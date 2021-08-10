import checkMinimumRequiredProps from './checkMinimumRequiredProps';
import useGetList from '../dataProvider/useGetList';

/**
 * Prepare data for the List view
 *
 * @param {Object} props The props passed to the List component.
 *
 * @return {Object} controllerProps Fetched and computed data for the List view
 *
 * @example
 *
 * import ListView from './ListView';
 *
 * const MyList = props => {
 *     const controllerProps = useListController(props);
 *     return <ListView {...controllerProps} {...props} />;
 * }
 */

const useListController = props => {
  checkMinimumRequiredProps(
    'List',
    ['basePath', 'resource', 'resourcePath'],
    props,
  );

  const { basePath, resource, resourcePath } = props;

  /**
   * We want the list of ids to be always available for optimistic rendering,
   * and therefore we need a custom action (CRUD_GET_LIST) that will be used.
   */
  const { ids, data, total, error, loading, loaded } = useGetList({
    resource,
    resourcePath,
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
 * Select the props injected by the useListController hook
 * to be passed to the List children need
 * This is an implementation of pick()
 */
export const getListControllerProps = props =>
  injectedProps.reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

/**
 * Select the props not injected by the useListController hook
 * to be used inside the List children to sanitize props injected by List
 * This is an implementation of omit()
 */
export const sanitizeListRestProps = props =>
  Object.keys(props)
    .filter(propName => !injectedProps.includes(propName))
    .reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

export default useListController;
