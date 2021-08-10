import { combineReducers } from 'redux';
import oneToMany from './oneToMany';

export default combineReducers({
  oneToMany: oneToMany,
});
