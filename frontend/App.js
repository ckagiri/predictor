// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import jsonServerProvider from 'jsonServerProvider';
import { createAppStore, DataProviderContext } from 'lib/core';
import Resource from 'admin/Resource';
import { CompetitionList } from 'admin/competitions';
import { SeasonList } from 'admin/seasons';
import { GameRoundList } from 'admin/gamerounds';
import { MatchList } from 'admin/matches';
import { AppLocationContext, ResourceBreadcrumbItems } from 'navigation';
import { Breadcrumb } from 'navigation/breadcrumb';

const history = createBrowserHistory();
const dataProvider = jsonServerProvider('/api');
const CatchAll = () => <div>Oops!</div>;

const App = () => {
  return (
    <Provider
      store={createAppStore({
        initialState: {
          resources: {
            competitions: {},
            seasons: {},
            gamerounds: {},
            matches: {},
          },
        },
        history: history,
      })}
    >
      <DataProviderContext.Provider value={dataProvider}>
        <ConnectedRouter history={history}>
          <Switch>
            <Redirect exact from="/" to="/admin" />
            <Redirect exact from="/admin" to="/admin/competitions" />
            <Route path="/admin">
              <AppLocationContext>
                <Breadcrumb>
                  <ResourceBreadcrumbItems />
                </Breadcrumb>
                <Resource
                  name="competitions"
                  path="/competitions"
                  list={CompetitionList}
                />
                <Resource
                  name="seasons"
                  path="/competitions/:competition/seasons"
                  list={SeasonList}
                />
                <Resource
                  name="gamerounds"
                  path="/competitions/:competition/seasons/:season/gamerounds"
                  list={GameRoundList}
                />
                <Resource
                  name="matches"
                  path="/competitions/:competition/seasons/:season/matches"
                  list={MatchList}
                />
                <Resource
                  name="matches"
                  path="/competitions/:competition/seasons/:season/gamerounds/:round/matches"
                  list={MatchList}
                />
              </AppLocationContext>
            </Route>
            <CatchAll />
          </Switch>
        </ConnectedRouter>
      </DataProviderContext.Provider>
    </Provider>
  );
};

export default App;
