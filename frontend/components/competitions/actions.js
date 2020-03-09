import * as ActionTypes from './constants';

export const prime = () => ({ type: ActionTypes.PRIME_START });

export const primeComplete = () => ({ type: ActionTypes.PRIME_COMPLETE });

export const primeError = error => ({ type: ActionTypes.PRIME_ERROR, error });

export const getCompetitions = () => ({
  type: ActionTypes.GET_COMPETITIONS_START,
});

export const getCompetitionsComplete = competitions => ({
  type: ActionTypes.GET_COMPETITIONS_COMPLETE,
  payload: competitions,
});

export const selectCompetition = competitionSlug => ({
  type: ActionTypes.SELECT_COMPETITION,
  payload: competitionSlug,
});

export const getSeasons = () => ({ type: ActionTypes.GET_SEASONS_START });

export const getSeasonsComplete = (competitionSlug, seasons) => ({
  type: ActionTypes.GET_SEASONS_COMPLETE,
  payload: { competitionSlug, seasons },
});

export const selectSeason = seasonId => ({
  type: ActionTypes.SELECT_SEASON,
  payload: seasonId,
});

export const setSeasonData = (seasonId, { teams, matches, predictions }) => ({
  type: ActionTypes.SET_SEASON_DATA,
  payload: {
    seasonId,
    teams,
    matches,
    predictions,
  },
});

export const selectGameRound = gameRound => ({
  type: ActionTypes.SELECT_GAME_ROUND,
  payload: gameRound,
});

export const loadMatchesPage = () => ({ type: ActionTypes.LOAD_MATCHES_PAGE });
