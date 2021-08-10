import { combineReducers } from 'redux';
import ids from './ids';
import total from './total';

export default combineReducers({
  ids: ids,
  total: total,
});
