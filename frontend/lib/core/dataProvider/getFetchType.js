import { GET_LIST, GET_MANY_REFERENCE } from '../core';

/**
 * Get a fetch type for a data provider verb.
 *
 * The fetch type is used in reducers.
 */
export default actionType => {
  switch (actionType) {
    case 'getList':
      return GET_LIST;
    case 'getManyReference':
      return GET_MANY_REFERENCE;

    default:
      return actionType;
  }
};
