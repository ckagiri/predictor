import uniq from 'lodash/uniq';
import {
  CRUD_GET_LIST_SUCCESS,
  CRUD_GET_ONE_SUCCESS,
  CRUD_CREATE_SUCCESS,
} from '../../../../actions';
import getFetchedAt from '../../../../util/getFetchedAt';
import { DELETE, DELETE_MANY } from '../../../../core';

export const addRecordIdsFactory = getFetchedAtCallback => (
  newRecordIds = [],
  oldRecordIds
) => {
  const newFetchedAt = getFetchedAtCallback(
    newRecordIds,
    oldRecordIds.fetchedAt
  );
  const recordIds = uniq(
    oldRecordIds.filter(id => !!newFetchedAt[id]).concat(newRecordIds)
  );

  Object.defineProperty(recordIds, 'fetchedAt', {
    value: newFetchedAt,
  }); // non enumerable by default
  return recordIds;
};

const addRecordIds = addRecordIdsFactory(getFetchedAt);

// Todo fix
const idsReducer = (
  previousState = [],
  action
) => {
  if (action.meta && action.meta.optimistic) {
    if (action.meta.fetch === DELETE) {
      const index = previousState
        .map(el => el === action.payload.id) // eslint-disable-line eqeqeq
        .indexOf(true);
      if (index === -1) {
        return previousState;
      }
      const newState = [
        ...previousState.slice(0, index),
        ...previousState.slice(index + 1),
      ];

      Object.defineProperty(newState, 'fetchedAt', {
        value: previousState.fetchedAt,
      });

      return newState;
    }
    if (action.meta.fetch === DELETE_MANY) {
      const newState = previousState.filter(
        el => !action.payload.ids.includes(el)
      );
      Object.defineProperty(newState, 'fetchedAt', {
        value: previousState.fetchedAt,
      });

      return newState;
    }
  }

  switch (action.type) {
    case CRUD_GET_LIST_SUCCESS:
      return addRecordIds(
        action.payload.data.map(({ id }) => id),
        []
      );
    case CRUD_GET_ONE_SUCCESS:
    case CRUD_CREATE_SUCCESS:
      return addRecordIds([action.payload.data.id], previousState);
    default:
      return previousState;
  }
};

export default idsReducer;

export const getIds = state => state;
