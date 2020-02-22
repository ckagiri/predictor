import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';

import CompetitionsPage from 'components/competitions/Loadable';
import GlobalStyle from '../../global-styles';
const AppWrapper = styled.div`
  max-width: calc(768px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
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
      <GlobalStyle />
    </AppWrapper>
  );
}
