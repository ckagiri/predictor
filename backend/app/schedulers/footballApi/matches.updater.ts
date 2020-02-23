import { from, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { MatchEntity } from '../../../db/models/match.model';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../db/repositories/match.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export interface MatchesUpdater {
  updateGameDetails(apiMatches: any[]): Promise<MatchEntity>;
}

const matchChanged = (apiMatch: any, dbMatch: MatchEntity) => {
  if (apiMatch.status !== dbMatch.status) {
    return true;
  }

  if (
    apiMatch.result.goalsHomeTeam !== dbMatch!.result!.goalsHomeTeam ||
    apiMatch.result.goalsAwayTeam !== dbMatch!.result!.goalsAwayTeam
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
};

export class MatchesUpdaterImpl implements MatchesUpdater {
  public static getInstance(provider: ApiProvider) {
    return new MatchesUpdaterImpl(MatchRepositoryImpl.getInstance(provider));
  }

  constructor(private matchRepo: MatchRepository) {}

  public updateGameDetails(apiMatches: any[]) {
    const externalIdToApiMatchMap: any = new Map<string, any>();
    const externalIds: string[] = [];
    for (const apiMatch of apiMatches) {
      externalIdToApiMatchMap[apiMatch.id] = apiMatch;
      externalIds.push(apiMatch.id);
    }
    return this.matchRepo
      .findByExternalIds$(externalIds)
      .pipe(
        flatMap(dbMatches => {
          return from(dbMatches);
        }),
      )
      .pipe(
        flatMap(dbMatch => {
          const provider = this.matchRepo.Provider;
          const extId = dbMatch.externalReference[provider].id;
          const apiMatch = externalIdToApiMatchMap[extId];

          if (matchChanged(apiMatch, dbMatch)) {
            const id = dbMatch.id;
            const { result, status, odds } = apiMatch;
            const update: any = { result, status, odds };
            Object.keys(update).forEach(
              key => update[key] == null && delete update[key],
            );
            return this.matchRepo.findByIdAndUpdate$(id!, update);
          }
          return of(dbMatch);
        }),
      )
      .toPromise();
  }
}
