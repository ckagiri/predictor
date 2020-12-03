import uniq from 'lodash/uniq';
import {
  CRUD_GET_LIST_SUCCESS,
  CRUD_GET_ONE_SUCCESS,
  CRUD_CREATE_SUCCESS,
} from '../../../../actions';
import getFetchedAt from '../../../../util/getFetchedAt';

export const addRecordIdsFactory = getFetchedAtCallback => (
  newRecordIds = [],
  oldRecordIds,
) => {
  const newFetchedAt = getFetchedAtCallback(
    newRecordIds,
    oldRecordIds.fetchedAt,
  );
  const recordIds = uniq(
    oldRecordIds.filter(id => !!newFetchedAt[id]).concat(newRecordIds),
  );

  Object.defineProperty(recordIds, 'fetchedAt', {
    value: newFetchedAt,
  }); // non enumerable by default
  return recordIds;
};

const addRecordIds = addRecordIdsFactory(getFetchedAt);

const idsReducer = (previousState = [], action) => {
  switch (action.type) {
    case CRUD_GET_LIST_SUCCESS:
      return addRecordIds(
        action.payload.data.map(({ id }) => id),
        [],
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
