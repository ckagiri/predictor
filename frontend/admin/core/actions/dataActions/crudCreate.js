import { CREATE } from '../../core';

export const crudCreate = (
  resource,
  data,
  basePath,
  redirectTo = 'edit'
) => ({
  type: CRUD_CREATE,
  payload: { data },
  meta: {
    resource,
    fetch: CREATE,
    onSuccess: {
      notification: {
        body: 'Element created',
        level: 'info',
        messageArgs: {
          smart_count: 1,
        },
      },
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

export const CRUD_CREATE = 'RA/CRUD_CREATE';
export const CRUD_CREATE_LOADING = 'RA/CRUD_CREATE_LOADING';
export const CRUD_CREATE_FAILURE = 'RA/CRUD_CREATE_FAILURE';
export const CRUD_CREATE_SUCCESS = 'RA/CRUD_CREATE_SUCCESS';
