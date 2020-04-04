import { GET_MANY_REFERENCE } from '../../core';

export const crudGetManyReference = (
  reference,
  target,
  id,
  relatedTo,
  pagination,
  sort,
  filter,
  source,
) => ({
  type: CRUD_GET_MANY_REFERENCE,
  payload: { target, id, pagination, sort, filter, source },
  meta: {
    resource: reference,
    relatedTo,
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
