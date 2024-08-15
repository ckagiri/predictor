import { Match, getMatchStatus } from "../../../db/models/match.model";

export const matchChanged = (apiMatch: any, dbMatch: Match) => {
  if (!dbMatch) {
    return false;
  }

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
    (apiMatch.odds && apiMatch.odds.homeWin) !== dbMatch.odds?.homeWin ||
    (apiMatch.odds && apiMatch.odds.awayWin) !== dbMatch.odds?.awayWin ||
    (apiMatch.odds && apiMatch.odds.draw) !== dbMatch.odds?.draw
  ) {
    return true;
  }

  return false;
}

export const makeMatchUpdate = (apiMatch: any) => {
  const { score, status, odds } = apiMatch;
  const result = {
    goalsHomeTeam: score.fullTime.home,
    goalsAwayTeam: score.fullTime.away
  };
  const matchStatus = getMatchStatus(status);
  return { result, status: matchStatus, odds }
}
