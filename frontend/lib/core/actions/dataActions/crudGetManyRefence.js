import { GET_MANY_REFERENCE } from '../../core';

export const crudGetList = resource => ({
  type: CRUD_GET_MANY_REFERENCE,
  meta: {
    resource,
    fetch: GET_MANY_REFERENCE,
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_GET_MANY_REFERENCE = 'RA/CRUD_GET_MANY_REFERENCE';
export const CRUD_GET_MANY_REFERENCE_LOADING =
  'RA/CRUD_GET_MANY_REFERENCE_LOADING';
export const CRUD_GET_MANY_REFERENCE_FAILURE =
  'RA/CRUD_GET_MANY_REFERENCE_FAILURE';
export const CRUD_GET_MANY_REFERENCE_SUCCESS =
  'RA/CRUD_GET_MANY_REFERENCE_SUCCESS';
