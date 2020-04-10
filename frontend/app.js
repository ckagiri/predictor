// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// Load the favicon
// import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import { createHashHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';

import { Resource } from './admin/core';

import { CompetitionList } from './admin/CompetitionList';
import { CompetitionCreate } from './admin/CompetitionCreate';
import { CompetitionEdit } from './admin/CompetitionEdit';
import authProvider from './admin/authProvider';
import restServerProvider from './admin/restServerProvider';
import defaultI18nProvider from './admin/defaultI18nProvider';
import { AuthContext } from './admin/core/auth';
import { DataProviderContext } from './admin/core/dataProvider';
import createAdminStore from './admin/core/core/createAdminStore';
import TranslationProvider from './admin/core/i18n/TranslationProvider';
import CoreAdminRouter from './admin/core/core/CoreAdminRouter';
import { Layout } from './admin/materialui/layout';

const history = createHashHistory();
const dataProvider = restServerProvider('api');
const MOUNT_NODE = document.getElementById('app');

const renderCore = () => {
  return (
    <AuthContext.Provider value={authProvider}>
      <DataProviderContext.Provider value={dataProvider}>
        <TranslationProvider i18nProvider={defaultI18nProvider}>
          <ConnectedRouter history={history}>
            <CoreAdminRouter
              layout={Layout}
              title="Another One"
              catchall={() => null}
            >
              <Resource
                name="competitions"
                create={CompetitionCreate}
                edit={CompetitionEdit}
                list={CompetitionList}
              />
            </CoreAdminRouter>
          </ConnectedRouter>
        </TranslationProvider>
      </DataProviderContext.Provider>
    </AuthContext.Provider>
  );
};

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
