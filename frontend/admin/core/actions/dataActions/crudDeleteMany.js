import { DELETE_MANY } from '../../core';

export const crudDeleteMany = (
  resource,
  ids,
  basePath,
  refresh = true
) => ({
  type: CRUD_DELETE_MANY,
  payload: { ids },
  meta: {
    resource,
    fetch: DELETE_MANY,
    onSuccess: {
      notification: {
        body: 'Element deleted |||| %{smart_count} elements deleted',
        level: 'info',
        messageArgs: {
          smart_count: ids.length,
        },
      },
      basePath,
      refresh,
      unselectAll: true,
    },
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_DELETE_MANY = 'RA/CRUD_DELETE_MANY';
export const CRUD_DELETE_MANY_LOADING = 'RA/CRUD_DELETE_MANY_LOADING';
export const CRUD_DELETE_MANY_FAILURE = 'RA/CRUD_DELETE_MANY_FAILURE';
export const CRUD_DELETE_MANY_SUCCESS = 'RA/CRUD_DELETE_MANY_SUCCESS';
