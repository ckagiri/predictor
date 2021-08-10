import { CRUD_GET_LIST_SUCCESS } from '../../../actions/dataActions';

const totalReducer = (previousState = null, action) => {
  if (action.type === CRUD_GET_LIST_SUCCESS) {
    return action.payload.total;
  }
  return previousState;
};

export default totalReducer;
