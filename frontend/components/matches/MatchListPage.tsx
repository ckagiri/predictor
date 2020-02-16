import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { routeToMatchesPage } from 'components/competitions/actions';

function MatchListPage(props) {
  useEffect(() => {
    const { season } = props.match.params;
    if (!season) {
      props.routeToMatchesPage();
    }
  }, [props.match.params]);
  return <div>Matches</div>;
}

interface DispatchProps {
  routeToMatchesPage(): void;
}

export function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    routeToMatchesPage: () => dispatch(routeToMatchesPage())
  };
}

const mapStateToProps = state => {
  return {
    isPreloading: !!(state.game && state.game.preloading),
    isPreloaded: !!(state.game && state.game.preloaded)
  };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withConnect,
  memo
)(MatchListPage);
