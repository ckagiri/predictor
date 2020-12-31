import { isValidElement, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import get from 'lodash/get';

import checkMinimumRequiredProps from './checkMinimumRequiredProps';
import useVersion from './useVersion';
import { CRUD_GET_LIST } from '../actions';
import { useNotify } from '../sideEffect';
import useGetList from '../dataProvider/useGetList';

const defaultSort = {
  field: 'id',
  order: SORT_ASC,
};

const defaultData = {};

/**
 * Prepare data for the List view
 *
 * @param {Object} props The props passed to the List component.
 *
 * @return {Object} controllerProps Fetched and computed data for the List view
 *
 * @example
 *
 * import { useListController } from 'react-admin';
 * import ListView from './ListView';
 *
 * const MyList = props => {
 *     const controllerProps = useListController(props);
 *     return <ListView {...controllerProps} {...props} />;
 * }
 */
const useListController = props => {
  checkMinimumRequiredProps('List', ['basePath', 'resource', 'resourcePath'], props);

  const {
    basePath,
    resource,
    resourcePath,
    hasCreate,
    filterDefaultValues,
    sort = defaultSort,
    perPage = 10,
    filter,
    debounce = 500,
  } = props;

  if (filter && isValidElement(filter)) {
    throw new Error(
      '<List> received a React element as `filter` props. If you intended to set the list filter elements, use the `filters` (with an s) prop instead. The `filter` prop is internal and should not be set by the developer.',
    );
  }

  const notify = useNotify();
  const version = useVersion();

  /**
   * We want the list of ids to be always available for optimistic rendering,
   * and therefore we need a custom action (CRUD_GET_LIST) that will be used.
   */
  const { ids, total, loading, loaded } = useGetList(
    resource,
    resourcePath,
    {},
    {},
    {},
    {
      action: CRUD_GET_LIST,
      version,
      onFailure: error =>
        notify(
          typeof error === 'string'
            ? error
            : error.message || 'ra.notification.http_error',
          'warning',
        ),
    },
  );

  const data = useSelector(state =>
    get(state.admin.resources, [resource, 'data'], defaultData),
  );

  // When the user changes the page/sort/filter, this controller runs the
  // useGetList hook again. While the result of this new call is loading,
  // the ids and total are empty. To avoid rendering an empty list at that
  // moment, we override the ids and total with the latest loaded ones.
  const defaultIds = useSelector(state =>
    get(state.admin.resources, [resource, 'list', 'ids'], []),
  );
  const defaultTotal = useSelector(state =>
    get(state.admin.resources, [resource, 'list', 'total'], 0),
  );

  const defaultTitle = resource;

  return {
    basePath,
    data,
    defaultTitle,
    hasCreate,
    ids: typeof total === 'undefined' ? defaultIds : ids,
    loaded: loaded || defaultIds.length > 0,
    loading,
    resource,
    total: typeof total === 'undefined' ? defaultTotal : total,
    version,
  };
};

export const injectedProps = [
  'basePath',
  'currentSort',
  'data',
  'defaultTitle',
  'displayedFilters',
  'filterValues',
  'hasCreate',
  'hideFilter',
  'ids',
  'loading',
  'loaded',
  'onSelect',
  'onToggleItem',
  'onUnselectItems',
  'page',
  'perPage',
  'refresh',
  'resource',
  'resourcePath',
  'selectedIds',
  'setFilters',
  'setPage',
  'setPerPage',
  'setSort',
  'showFilter',
  'total',
  'version',
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
