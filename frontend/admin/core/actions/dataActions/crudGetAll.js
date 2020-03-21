import { GET_LIST } from '../../core';

export const crudGetAll = (
  resource,
  sort,
  filter,
  maxResults,
  callback
) => ({
  type: CRUD_GET_ALL,
  payload: { sort, filter, pagination: { page: 1, perPage: maxResults } },
  meta: {
    resource,
    fetch: GET_LIST,
    onSuccess: {
      callback,
    },
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_GET_ALL = 'RA/CRUD_GET_ALL';
export const CRUD_GET_ALL_LOADING = 'RA/CRUD_GET_ALL_LOADING';
export const CRUD_GET_ALL_FAILURE = 'RA/CRUD_GET_ALL_FAILURE';
export const CRUD_GET_ALL_SUCCESS = 'RA/CRUD_GET_ALL_SUCCESS';
