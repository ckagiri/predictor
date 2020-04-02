import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { loadMatchesPage } from 'components/competitions/actions';
import { seasonMatchesSelector } from 'components/competitions/selectors';

function MatchesPage(props) {
  useEffect(() => {
    const { season } = props.match.params;
    if (!season) {
      props.loadMatchesPage();
    }
  }, [props.match.params]);
  console.log(props.matches);
  return (
    <div>
      Ligi Predictor Matches
      <br />
      <ul>
        {props.matches
          .sort((m1, m2) => (m1.matchRound > m2.matchRound ? 1 : -1))
          .map(m => (
            <li key={m.id}>
              <span>{m.matchRound}</span> <span>{m.slug}</span>{' '}
              {m.status === 'FINISHED' && (
                <span>
                  {`${m.result.goalsHomeTeam} - ${m.result.goalsAwayTeam}`}
                </span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

MatchesPage.propTypes = {
  loadMatchesPage: PropTypes.func,
  match: PropTypes.any,
  matches: PropTypes.array,
};

export function mapDispatchToProps(dispatch) {
  return {
    loadMatchesPage: () => dispatch(loadMatchesPage()),
  };
}

const mapStateToProps = state => ({
  isPriming: !!(state.game && state.game.priming),
  isPrimed: !!(state.game && state.game.primed),
  matches: seasonMatchesSelector(state.game),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect, memo)(MatchesPage);
