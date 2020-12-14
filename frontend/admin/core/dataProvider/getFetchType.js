import {
  GET_LIST,
  GET_ONE,
  UPDATE,
} from '../core';

/**
 * Get a fetch type for a data provider verb.
 *
 * The fetch type is used in reducers.
 *
 * @example getFetchType('getMany'); // 'GET_MANY'
 */
export default actionType => {
  switch (actionType) {
    case 'getList':
      return GET_LIST;
    case 'getOne':
      return GET_ONE;
    case 'update':
      return UPDATE;

    default:
      return actionType;
  }
};
