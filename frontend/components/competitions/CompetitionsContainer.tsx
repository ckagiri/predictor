import React, { useEffect, memo } from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';

import reducer from './reducer';
import { Switch, Route, Redirect } from 'react-router';
import saga from './saga';
import { preload } from './actions';
import MatchListPage from 'components/matches/MatchListPage';

const key = 'game';

//interface OwnProps {}
// interface StateProps {
//   isPriming: boolean;
//   error: object | boolean;
// }

interface DispatchProps {
  preloadData(): void;
}

function CompetitionsPage() {
  return <h1>Compes</h1>;
}

function SeasonsPage() {
  return <h1>Seasons</h1>;
}

export function CompetitionsContainer(props) {
  useInjectReducer({ key: key, reducer: reducer });
  useInjectSaga({ key: key, saga: saga });

  useEffect(() => {
    if (!props.isPreloaded) {
      props.preloadData();
    }
  }, [props.isPreloaded]);

  const { isPreloaded } = props;
  return (
    isPreloaded && (
      <Switch>
        <Route path="/competitions" exact component={CompetitionsPage} />
        <Route path="/competitions/:competition" exact component={MatchListPage} />
        <Route path="/competitions/:competition/seasons" exact component={SeasonsPage} />
        <Redirect
          from="/competitions/:competition/seasons/:season"
          exact
          to="/competitions/:competition/seasons/:season/matches"
        />
        <Route
          path="/competitions/:competition/seasons/:season/matches"
          exact
          component={MatchListPage}
        />
      </Switch>
    )
  );
}

export function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    preloadData: () => dispatch(preload())
  };
}

const mapStateToProps = state => {
  const game = state.game || {};
  return {
    isPreloading: !!game.preloading,
    isPreloaded: !!game.preloaded,
    currentPage: game.currentPage
  };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withConnect,
  memo
)(CompetitionsContainer);
