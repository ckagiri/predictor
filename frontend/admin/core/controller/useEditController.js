import { useCallback } from 'react';

import useVersion from './useVersion';
import checkMinimumRequiredProps from './checkMinimumRequiredProps';
import {
  useNotify,
  useRedirect,
  useRefresh,
} from '../sideEffect';
import { useGetOne, useUpdate } from '../dataProvider';
import { CRUD_GET_ONE, CRUD_UPDATE } from '../actions';

/**
 * Prepare data for the Edit view
 *
 * @param {Object} props The props passed to the Edit component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Edit view
 *
 * @example
 *
 * import { useEditController } from 'react-admin';
 * import EditView from './EditView';
 *
 * const MyEdit = props => {
 *     const controllerProps = useEditController(props);
 *     return <EditView {...controllerProps} {...props} />;
 * }
 */
const useEditController = props => {
  checkMinimumRequiredProps('Edit', ['basePath', 'resource'], props);
  const { basePath, id, resource, successMessage, undoable = true } = props;
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const version = useVersion();
  const { data: record, loading, loaded } = useGetOne(resource, id, {
    version, // used to force reload
    action: CRUD_GET_ONE,
    onFailure: () => {
      notify("Item doesn't exist", 'warning');
      redirect('list', basePath);
      refresh();
    },
  });

  const defaultTitle = resource;

  const [update, { loading: saving }] = useUpdate(
    resource,
    id,
    {}, // set by the caller
    record
  );

  const save = useCallback(
    (
      data,
      redirectTo,
      { onSuccess, onFailure } = {}
    ) =>
      update(
        { payload: { data } },
        {
          action: CRUD_UPDATE,
          onSuccess: onSuccess
            ? onSuccess
            : () => {
              notify(
                successMessage || 'Updated',
                'info',
                {
                  smart_count: 1,
                },
                undoable
              );
              redirect(redirectTo, basePath, data.id, data);
            },
          onFailure: onFailure
            ? onFailure
            : error => {
              notify(
                typeof error === 'string'
                  ? error
                  : error.message ||
                  'Http Error',
                'warning'
              );
              if (undoable) {
                refresh();
              }
            },
          undoable,
        }
      ),
    [update, undoable, notify, successMessage, redirect, basePath, refresh]
  );

  return {
    loading,
    loaded,
    saving,
    defaultTitle,
    save,
    resource,
    basePath,
    record,
    redirect: DefaultRedirect,
    version,
  };
};

export default useEditController;

const DefaultRedirect = 'list';
