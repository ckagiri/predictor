import { GET_MANY } from '../../core';

export const crudGetMany = (
  resource,
  ids
) => ({
  type: CRUD_GET_MANY,
  payload: { ids },
  meta: {
    resource,
    fetch: GET_MANY,
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_GET_MANY = 'RA/CRUD_GET_MANY';
export const CRUD_GET_MANY_LOADING = 'RA/CRUD_GET_MANY_LOADING';
export const CRUD_GET_MANY_FAILURE = 'RA/CRUD_GET_MANY_FAILURE';
export const CRUD_GET_MANY_SUCCESS = 'RA/CRUD_GET_MANY_SUCCESS';

