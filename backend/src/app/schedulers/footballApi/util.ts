import {
  getMatchStatus,
  Match,
  MatchStatus,
} from '../../../db/models/match.model.js';

export const matchChanged = (apiMatch: any, dbMatch: Match) => {
  const apiMatchStatus = getMatchStatus(apiMatch.status);
  if (dbMatch.status !== apiMatchStatus) {
    return true;
  }

  if (
    apiMatch.score.fullTime.home !== dbMatch.result?.goalsHomeTeam ||
    apiMatch.score.fullTime.away !== dbMatch.result?.goalsAwayTeam
  ) {
    return true;
  }

  if (
    apiMatch.odds?.homeWin !== dbMatch.odds?.homeWin ||
    apiMatch.odds?.awayWin !== dbMatch.odds?.awayWin ||
    apiMatch.odds?.draw !== dbMatch.odds?.draw
  ) {
    return true;
  }

  return false;
};

export const makeMatchUpdate = (apiMatch: any) => {
  const { odds, score, status } = apiMatch;
  const result = {
    goalsAwayTeam: score.fullTime.away,
    goalsHomeTeam: score.fullTime.home,
  };
  const matchStatus = getMatchStatus(status);
  return { odds, result, status: matchStatus };
};

export const repickJoker = (apiMatch: any, dbMatch: Match) => {
  const apiMatchStatus = getMatchStatus(apiMatch.status);
  if (
    dbMatch.status === MatchStatus.SCHEDULED &&
    [MatchStatus.CANCELLED, MatchStatus.POSTPONED].includes(apiMatchStatus)
  ) {
    return true;
  }
  return false;
};
