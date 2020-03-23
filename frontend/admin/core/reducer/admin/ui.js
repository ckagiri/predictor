import {
  TOGGLE_SIDEBAR,
  SET_SIDEBAR_VISIBILITY,
  REFRESH_VIEW,
  START_OPTIMISTIC_MODE,
  STOP_OPTIMISTIC_MODE,
} from '../../actions';

const defaultState = {
  sidebarOpen: false,
  optimistic: false,
  viewVersion: 0,
};

const uiReducer = (
  previousState = defaultState,
  action
) => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return {
        ...previousState,
        sidebarOpen: !previousState.sidebarOpen,
      };
    case SET_SIDEBAR_VISIBILITY:
      return { ...previousState, sidebarOpen: action.payload };
    case REFRESH_VIEW:
      return {
        ...previousState,
        viewVersion: previousState.viewVersion + 1,
      };
    case START_OPTIMISTIC_MODE:
      return { ...previousState, optimistic: true };
    case STOP_OPTIMISTIC_MODE:
      return { ...previousState, optimistic: false };
    default:
      return previousState;
  }
};

export default uiReducer;
