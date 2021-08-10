import { CRUD_GET_LIST_SUCCESS } from '../../../actions';

const idsReducer = (previousState = [], action) => {
  switch (action.type) {
    case CRUD_GET_LIST_SUCCESS:
      return action.payload.data.map(({ id }) => id);
    default:
      return previousState;
  }
};

export default idsReducer;

export const getIds = state => state;
