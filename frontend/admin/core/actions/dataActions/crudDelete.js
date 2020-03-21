import { DELETE } from '../../core';

export const crudDelete = (
  resource,
  id,
  previousData,
  basePath,
  redirectTo = 'list',
  refresh = true
) => ({
  type: CRUD_DELETE,
  payload: { id, previousData },
  meta: {
    resource,
    fetch: DELETE,
    onSuccess: {
      notification: {
        body: 'Element deleted',
        level: 'info',
        messageArgs: {
          smart_count: 1,
        },
      },
      refresh,
      redirectTo,
      basePath,
    },
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_DELETE = 'RA/CRUD_DELETE';
export const CRUD_DELETE_LOADING = 'RA/CRUD_DELETE_LOADING';
export const CRUD_DELETE_FAILURE = 'RA/CRUD_DELETE_FAILURE';
export const CRUD_DELETE_SUCCESS = 'RA/CRUD_DELETE_SUCCESS';
