// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// Load the favicon
// import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import { createHashHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import { Resource } from './admin/core';
import AppBar from './admin/materialui/layout/AppBar';
import { CompetitionList } from './admin/CompetitionList';
import { CompetitionCreate } from './admin/CompetitionCreate';
import { CompetitionEdit } from './admin/CompetitionEdit';
import { SeasonList } from './admin/SeasonList';
import { SeasonCreate } from './admin/SeasonCreate';
import { SeasonEdit } from './admin/SeasonEdit';
import authProvider from './admin/authProvider';
import restServerProvider from './admin/restServerProvider';
import defaultI18nProvider from './admin/defaultI18nProvider';
import { AuthContext } from './admin/core/auth';
import { DataProviderContext } from './admin/core/dataProvider';
import createAdminStore from './admin/core/core/createAdminStore';
import TranslationProvider from './admin/core/i18n/TranslationProvider';
import CoreAdminRouter from './admin/core/core/CoreAdminRouter';
import { Layout } from './admin/materialui/layout';
import { useTimeout } from './admin/core/util'
import { createMuiTheme } from '@material-ui/core/styles';

const history = createHashHistory();
const dataProvider = restServerProvider('api');
const MOUNT_NODE = document.getElementById('app');

const AdminRouter = () => {
  const oneMilliSecondHasPassed = useTimeout(1);
  if (oneMilliSecondHasPassed) {
    return (
      <Switch>
        <Route
          exact
          path="/competitions"
        >
          <CompetitionList />
        </Route>
        <Route
          exact
          path="/competitions/:slug/seasons"
          render={routeProps =>
            <SeasonList
              resource="seasons"
              hasEdit
              basePath={routeProps.match.url} {...routeProps}
            />
          }
        />
      </Switch>
    )
  } else return null;
}

const renderCore = () => {
  return (
    <AuthContext.Provider value={authProvider}>
      <DataProviderContext.Provider value={dataProvider}>
        <TranslationProvider i18nProvider={defaultI18nProvider}>
          <ThemeProvider theme={createMuiTheme()}>
            <Resource name="competitions" intent="registration" />
            <Resource name="seasons" intent="registration" />
            <ConnectedRouter history={history}>
              <Switch>
                <Route
                  path="/"
                >
                  <AdminRouter />
                </Route>
              </Switch>
            </ConnectedRouter>
          </ThemeProvider>
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
