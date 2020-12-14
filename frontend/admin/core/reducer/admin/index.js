import { combineReducers } from 'redux';
import resources, {
  getResources as resourceGetResources,
  getReferenceResource as resourceGetReferenceResource,
} from './resource';
import loading from './loading';
import notifications from './notifications';
import ui from './ui';

const defaultReducer = () => null;

export default combineReducers({
  /**
   * ts-jest does some aggressive module mocking when unit testing reducers individually.
   * To avoid 'No reducer provided for key "..."' warnings,
   * we pass default reducers. Sorry for legibility.
   *
   * @see https://stackoverflow.com/questions/43375079/redux-warning-only-appearing-in-tests
   */
  resources: resources || defaultReducer,
  loading: loading || defaultReducer,
  notifications: notifications || defaultReducer,
  ui: ui || defaultReducer,
});


export const getResources = state => resourceGetResources(state.resources);
