import { UPDATE } from '../../core';

export const crudUpdate = (
  resource,
  id,
  data,
  previousData,
  basePath,
  redirectTo = 'show',
  refresh = true
) => ({
  type: CRUD_UPDATE,
  payload: { id, data, previousData },
  meta: {
    resource,
    fetch: UPDATE,
    onSuccess: {
      notification: {
        body: 'Element updated',
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

export const CRUD_UPDATE = 'RA/CRUD_UPDATE';
export const CRUD_UPDATE_LOADING = 'RA/CRUD_UPDATE_LOADING';
export const CRUD_UPDATE_FAILURE = 'RA/CRUD_UPDATE_FAILURE';
export const CRUD_UPDATE_SUCCESS = 'RA/CRUD_UPDATE_SUCCESS';