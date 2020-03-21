import { UPDATE_MANY } from '../../core';

export const crudUpdateMany = (
  resource,
  ids,
  data,
  basePath,
  refresh = true
) => ({
  type: CRUD_UPDATE_MANY,
  payload: { ids, data },
  meta: {
    resource,
    fetch: UPDATE_MANY,
    onSuccess: {
      notification: {
        body: 'Element updated |||| %{smart_count} elements updated',
        level: 'info',
        messageArgs: {
          smart_count: ids.length,
        },
      },
      basePath,
      refresh,
      unselectAll: true,
    },
    onFailure: {
      notification: {
        body: 'Server communication error',
        level: 'warning',
      },
    },
  },
});

export const CRUD_UPDATE_MANY = 'RA/CRUD_UPDATE_MANY';
export const CRUD_UPDATE_MANY_LOADING = 'RA/CRUD_UPDATE_MANY_LOADING';
export const CRUD_UPDATE_MANY_FAILURE = 'RA/CRUD_UPDATE_MANY_FAILURE';
export const CRUD_UPDATE_MANY_SUCCESS = 'RA/CRUD_UPDATE_MANY_SUCCESS';