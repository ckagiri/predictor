import { GET_ONE } from '../../core';

export const crudGetOne = (
  resource,
  id,
  basePath,
  refresh = true
) => ({
  type: CRUD_GET_ONE,
  payload: { id },
  meta: {
    resource,
    fetch: GET_ONE,
    basePath,
    onFailure: {
      notification: {
        body: 'Element does not exist',
        level: 'warning',
      },
      redirectTo: 'list',
      refresh,
    },
  },
});

export const CRUD_GET_ONE = 'RA/CRUD_GET_ONE';
export const CRUD_GET_ONE_LOADING = 'RA/CRUD_GET_ONE_LOADING';
export const CRUD_GET_ONE_FAILURE = 'RA/CRUD_GET_ONE_FAILURE';
export const CRUD_GET_ONE_SUCCESS = 'RA/CRUD_GET_ONE_SUCCESS';
