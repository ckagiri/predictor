import React, { useEffect, memo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';

import { Switch, Route, Redirect } from 'react-router';
import MatchesPage from 'components/matches/MatchesPage';
import reducer from './reducer';
import saga from './saga';
import { prime } from './actions';

const key = 'game';

function CompetitionsPage() {
  return <h1>Compes</h1>;
}

function SeasonsPage() {
  return <h1>Seasons</h1>;
}

export function CompetitionsContainer(props) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  useEffect(() => {
    if (!props.isPrimed) {
      props.prime();
    }
  }, [props.isPrimed]);

  const { isPrimed } = props;
  return (
    isPrimed && (
      <Switch>
        <Route path="/competitions" exact component={CompetitionsPage} />
        <Route
          path="/competitions/:competition"
          exact
          component={SeasonsPage}
        />
        <Route
          path="/competitions/:competition/seasons"
          exact
          component={SeasonsPage}
        />
        <Redirect
          from="/competitions/:competition/seasons/:season"
          exact
          to="/competitions/:competition/seasons/:season/matches"
        />
        <Route
          path="/competitions/:competition/seasons/:season/matches"
          exact
          component={MatchesPage}
        />
      </Switch>
    )
  );
}

export function mapDispatchToProps(dispatch) {
  return {
    prime: () => dispatch(prime()),
  };
}

const mapStateToProps = state => {
  const game = state.game || {};
  return {
    isPriming: !!game.priming,
    isPrimed: !!game.primed,
  };
};

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect, memo)(CompetitionsContainer);
