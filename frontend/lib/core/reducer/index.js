import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import resources from './resource';
import loading from './loading';
import references from './references';

export default history =>
  combineReducers({
    resources: resources,
    router: connectRouter(history),
    loading: loading,
    references: references,
  });
