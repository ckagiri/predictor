import { CRUD_GET_LIST_SUCCESS } from '../../../../actions/dataActions';

/**
 * This resource reducer is false until the list loads successfully
 */
const loadedOnce = (previousState = false, { type }) => {
  // early return
  if (previousState === true) {
    return previousState;
  }
  if (type === CRUD_GET_LIST_SUCCESS) {
    return true;
  }
  return previousState;
};

export default loadedOnce;
