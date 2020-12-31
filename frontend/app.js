// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React, { createElement } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// Load the favicon
// import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { Resource } from './admin/core';
import authProvider from './admin/authProvider';
import CoreAdminRouter from './admin/core/core/CoreAdminRouter'
import jsonServerProvider from './admin/jsonServerProvider';
import { DataProviderContext } from './admin/core/dataProvider';
import createAdminStore from './admin/core/core/createAdminStore';
import { Switch } from '@material-ui/core';
import { CompetitionList } from './admin/CompetitionList';
import { CompetitionCreate } from './admin/CompetitionCreate';
import { CompetitionEdit } from './admin/CompetitionEdit';
import { SeasonList } from './admin/SeasonList';
import { SeasonCreate } from './admin/SeasonCreate';
import { SeasonEdit } from './admin/SeasonEdit';


const history = createBrowserHistory();
const dataProvider = jsonServerProvider('api');
const MOUNT_NODE = document.getElementById('app');

const Layout = ({ children }) => <div>{children}</div>
const Matches = () => <div>Mathces Budah</div>
const catchAll = () => <div>Catch All</div>

const RoutesWithLayout = (
  <Layout>
    <Switch>
      <Route
        path="/competitions/:competition/:season/matches"
      >
        <Matches />
      </Route>
      <Route
        render={routeProps =>
          createElement(catchAll, {
            ...routeProps,
          })
        }
      />
    </Switch>
  </Layout>
)

const renderCore = () => {
  <AuthContext.Provider value={authProvider}>
    <DataProviderContext.Provider value={dataProvider}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/admin"
          >
            <CoreAdminRouter>
              <Resource
                name="competitions"
                basePath="/competitions"
                list={CompetitionList}
              />
              <Resource
                name="seasons"
                basePath="/competitions/:slug/seasons"
                list={SeasonList}
              />
            </CoreAdminRouter>
          </Route>
          <Route
            path="/"
          >
            <RoutesWithLayout />
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
