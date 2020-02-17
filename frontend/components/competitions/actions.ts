import { action } from 'typesafe-actions';

import ActionTypes from './constants';

export const prime = () => action(ActionTypes.PRIME_START);
export const primeComplete = () => action(ActionTypes.PRIME_COMPLETE);
export const primeError = (error: object) =>
  action(ActionTypes.PRIME_ERROR, error);
export const getCompetitions = () => action(ActionTypes.GET_COMPETITIONS_START);
export const getCompetitionsComplete = competitions =>
  action(ActionTypes.GET_COMPETITIONS_COMPLETE, competitions);
export const selectCompetition = competitionSlug =>
  action(ActionTypes.SELECT_COMPETITION, competitionSlug);
export const getSeasons = () => action(ActionTypes.GET_SEASONS_START);
export const getSeasonsComplete = (
  competitionSlug: string,
  seasons: object[],
) => action(ActionTypes.GET_SEASONS_COMPLETE, { competitionSlug, seasons });
export const selectSeason = seasonId =>
  action(ActionTypes.SELECT_SEASON, seasonId);
export const setSeasonData = (
  seasonId,
  { teams, matches, predictions, rounds },
) =>
  action(ActionTypes.SET_SEASON_DATA, {
    seasonId,
    teams,
    matches,
    predictions,
    rounds,
  });
export const selectGameRound = (seasonId, round) =>
  action(ActionTypes.SELECT_GAME_ROUND, seasonId, round);
export const loadMatchesPage = () => action(ActionTypes.LOAD_MATCHES_PAGE);
