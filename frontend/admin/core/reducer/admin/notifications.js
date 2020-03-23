import {
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
} from '../../actions/notificationActions';
import { UNDO } from '../../actions/undoActions';

const notificationsReducer = (
  previousState = [],
  action
) => {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return previousState.concat(action.payload);
    case HIDE_NOTIFICATION:
    case UNDO:
      return previousState.slice(1);
    default:
      return previousState;
  }
};

export default notificationsReducer;
/**
 * Returns the first available notification to show
 * @param {Object} state - Redux state
 */
export const getNotification = state => state.admin.notifications[0];
