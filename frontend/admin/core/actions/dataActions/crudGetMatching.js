import { GET_LIST } from '../../core';

export const crudGetMatching = (
  reference,
  relatedTo,
  pagination,
  sort,
  filter
) => ({
  type: CRUD_GET_MATCHING,
  payload: { pagination, sort, filter },
  meta: {
    resource: reference,
    relatedTo,
    fetch: GET_LIST,
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_GET_MATCHING = 'RA/CRUD_GET_MATCHING';
export const CRUD_GET_MATCHING_LOADING = 'RA/CRUD_GET_MATCHING_LOADING';
export const CRUD_GET_MATCHING_FAILURE = 'RA/CRUD_GET_MATCHING_FAILURE';
export const CRUD_GET_MATCHING_SUCCESS = 'RA/CRUD_GET_MATCHING_SUCCESS';
