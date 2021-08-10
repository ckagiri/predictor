import { GET_LIST } from '../../core';

export const crudGetList = resource => ({
  type: CRUD_GET_LIST,
  meta: {
    resource,
    fetch: GET_LIST,
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_GET_LIST = 'RA/CRUD_GET_LIST';
export const CRUD_GET_LIST_LOADING = 'RA/CRUD_GET_LIST_LOADING';
export const CRUD_GET_LIST_FAILURE = 'RA/CRUD_GET_LIST_FAILURE';
export const CRUD_GET_LIST_SUCCESS = 'RA/CRUD_GET_LIST_SUCCESS';
