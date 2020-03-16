import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Redirect } from 'react-router-dom';

import CompetitionsPage from 'components/competitions/Loadable';

export default function App() {
  return (
    <div>
      <Helmet
        titleTemplate="%s - React.js Boilerplate"
        defaultTitle="React.js Boilerplate"
      >
        <meta name="description" content="A React.js Boilerplate application" />
      </Helmet>
      <Switch>
        <Redirect from="/" exact to="/competitions" />
        <Route path="/competitions" component={CompetitionsPage} />
      </Switch>
    </div>
  );
}
