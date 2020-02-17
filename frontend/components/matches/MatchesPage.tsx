import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { loadMatchesPage } from 'components/competitions/actions';
import { seasonMatchesSelector } from 'components/competitions/selectors';

function MatchListPage(props) {
  useEffect(() => {
    const { season } = props.match.params;
    if (!season) {
      props.loadMatchesPage();
    } else {

    }
  }, [props.match.params]);
  return (
    <div>Ligi Predictor MatchList
      <br />
      <ul>
        {props.matches.map(m =>
          <li key={m.id}>
            <span>{m.slug}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

interface DispatchProps {
  loadMatchesPage(): void;
}

export function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    loadMatchesPage: () => dispatch(loadMatchesPage())
  };
}

const mapStateToProps = state => {
  return {
    isPriming: !!(state.game && state.game.priming),
    isPrimed: !!(state.game && state.game.primed),
    matches: seasonMatchesSelector(state.game),
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
