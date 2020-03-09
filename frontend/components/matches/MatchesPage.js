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
  return (
    <div>
      Ligi Predictor Matches
      <br />
      <ul>
        {props.matches.map(m => (
          <li key={m.id}>
            <span>{m.slug}</span>
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
