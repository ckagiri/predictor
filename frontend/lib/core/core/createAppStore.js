import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';

import createAppReducer from '../reducer';
import { CLEAR_STATE } from '../actions/clearActions';

export default ({ history, initialState }) => {
  const appReducer = createAppReducer(history);

  const resettableAppReducer = (state, action) =>
    appReducer(
      action.type !== CLEAR_STATE
        ? state
        : // Erase data from the store but keep location, notifications, ui prefs, etc.
          // This allows e.g. to display a notification on logout
          {
            ...state,
            loading: 0,
            resources: {},
            references: { oneToMany: {} },
          },
      action,
    );

  const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25,
      })) ||
    compose;

  const store = createStore(
    resettableAppReducer,
    typeof initialState === 'function' ? initialState() : initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history))),
  );
  return store;
};
