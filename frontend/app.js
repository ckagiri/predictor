// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// Load the favicon
// import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { Resource } from './admin/core';
import authProvider from './admin/authProvider';
import CoreAdminRouter from './admin/core/core/CoreAdminRouter'
import restServerProvider from './admin/restServerProvider';
import { DataProviderContext } from './admin/core/dataProvider';
import createAdminStore from './admin/core/core/createAdminStore';

const history = createBrowserHistory();
const dataProvider = restServerProvider('api');
const MOUNT_NODE = document.getElementById('app');

const renderCore = () => {
  <AuthContext.Provider value={authProvider}>
    <DataProviderContext.Provider value={dataProvider}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/admin"
          >
            <CoreAdminRouter>
              <Resource name="competitions" basePath="/competitions" />
              <Resource name="seasons" basePath="/competitions/:slug/seasons" />
            </CoreAdminRouter>
          </Route>
        </Switch>
      </ConnectedRouter>
    </DataProviderContext.Provider>
  </AuthContext.Provider>
}

const render = () => {
  ReactDOM.render(
    <Provider
      store={createAdminStore({
        authProvider: authProvider,
        dataProvider: dataProvider,
        initialState: {},
        history: history,
      })}
    >
      {renderCore()}
    </Provider>,
    MOUNT_NODE,
  );
};

render();

if (module.hot) {
  // Hot reloadable React components
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./app'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render();
  });
}
