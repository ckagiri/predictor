import { from, lastValueFrom, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Match } from '../../../db/models/match.model';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../db/repositories/match.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export interface MatchesUpdater {
  updateGameDetails(externalMatches: any[]): Promise<Match | undefined>;
}

const matchChanged = (externalMatch: any, dbMatch: Match) => {
  if (externalMatch.status !== dbMatch.status) {
    return true;
  }

  if (
    externalMatch.result.goalsHomeTeam !== dbMatch.result?.goalsHomeTeam ||
    externalMatch.result.goalsAwayTeam !== dbMatch.result?.goalsAwayTeam
  ) {
    return true;
  }

  if (
    (externalMatch.odds && externalMatch.odds.homeWin) !== dbMatch.odds?.homeWin ||
    (externalMatch.odds && externalMatch.odds.awayWin) !== dbMatch.odds?.awayWin ||
    (externalMatch.odds && externalMatch.odds.draw) !== dbMatch.odds?.draw
  ) {
    return true;
  }

  return false;
};

export class MatchesUpdaterImpl implements MatchesUpdater {
  public static getInstance() {
    return new MatchesUpdaterImpl(MatchRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA));
  }

  constructor(private matchRepo: MatchRepository) { }

  public updateGameDetails(externalMatches: any[]) {
    const externalIdToExternalMatchMap: any = new Map<string, any>();
    const externalIds: string[] = [];
    for (const externalMatch of externalMatches) {
      externalIdToExternalMatchMap[externalMatch.id] = externalMatch;
      externalIds.push(externalMatch.id);
    }
    return lastValueFrom(
      this.matchRepo
        .findByExternalIds$(externalIds)
        .pipe(
          mergeMap(dbMatches => dbMatches)
        )
        .pipe(
          mergeMap(dbMatch => {
            const externalId = dbMatch.externalReference[ApiProvider.API_FOOTBALL_DATA].id;
            const externalMatch = externalIdToExternalMatchMap[externalId];

            if (matchChanged(externalMatch, dbMatch)) {
              const id = dbMatch.id;
              const { result, status, odds } = externalMatch;
              const update: any = { result, status, odds };
              Object.keys(update).forEach(
                key => update[key] == null && delete update[key],
              );
              return this.matchRepo.findByIdAndUpdate$(id!, update);
            }
            return of(dbMatch);
          }),
        )
    );
  }
}
