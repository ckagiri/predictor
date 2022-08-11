import { Match } from "../../../db/models/match.model";

export function matchChanged(apiMatch: any, dbMatch?: Match) {
  if (!dbMatch) {
    return false;
  }

  if (apiMatch.status !== dbMatch.status) {
    return true;
  }

  if (
    apiMatch.result.goalsHomeTeam !== dbMatch.result!.goalsHomeTeam ||
    apiMatch.result.goalsAwayTeam !== dbMatch.result!.goalsAwayTeam
  ) {
    return true;
  }

  if (
    (apiMatch.odds && apiMatch.odds.homeWin) !== dbMatch!.odds!.homeWin ||
    (apiMatch.odds && apiMatch.odds.awayWin) !== dbMatch!.odds!.awayWin ||
    (apiMatch.odds && apiMatch.odds.draw) !== dbMatch!.odds!.draw
  ) {
    return true;
  }

  return false;
}
