import {
  REFRESH_VIEW,
} from '../../actions';

const defaultState = {
  viewVersion: 0,
};

const uiReducer = (previousState = defaultState, action) => {
  switch (action.type) {
    case REFRESH_VIEW:
      return {
        ...previousState,
        viewVersion: previousState.viewVersion + 1,
      };
    default:
      return previousState;
  }
};

export default uiReducer;
