import { CRUD_CHANGE_LIST_PARAMS } from '../../../../actions/listActions';

const defaultState = {
  sort: null,
  order: null,
  page: 1,
  perPage: null,
  filter: {},
};

const paramsReducer = (previousState = defaultState, action) => {
  switch (action.type) {
    case CRUD_CHANGE_LIST_PARAMS:
      return action.payload;
    default:
      return previousState;
  }
};

export default paramsReducer;
