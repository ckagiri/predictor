import { of, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import {
  ISeasonRepository,
  SeasonRepository,
} from '../../../db/repositories/season.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { ISeason } from '../../../db/models/season.model';

export interface ISeasonUpdater {
  updateCurrentMatchRound(apiSeasons: any[]): Promise<ISeason>;
}

export class SeasonUpdater implements ISeasonUpdater {
  public static getInstance(provider: ApiProvider) {
    return new SeasonUpdater(SeasonRepository.getInstance(provider));
  }

  constructor(private seasonRepo: ISeasonRepository) {}

  public updateCurrentMatchRound(apiSeasons: any[]) {
    const externalIdToApiSeasonMap: any = new Map<string, any>();
    const externalIds: string[] = [];
    for (const apiSeason of apiSeasons) {
      externalIdToApiSeasonMap[apiSeason.id] = apiSeason;
      externalIds.push(apiSeason.id);
    }
    return this.seasonRepo
      .findByExternalIds$(externalIds)
      .pipe(
        flatMap(dbSeasons => {
          return from(dbSeasons);
        }),
      )
      .pipe(
        flatMap(dbSeason => {
          const provider = this.seasonRepo.Provider;
          // tslint:disable-next-line: no-string-literal
          const extId = dbSeason['externalReference'][provider]['id'];
          const extCurrentMatchRound =
            externalIdToApiSeasonMap[extId].currentMatchRound;

          if (dbSeason.currentMatchRound !== extCurrentMatchRound) {
            const id = dbSeason.id;
            const update = { currentMatchRound: extCurrentMatchRound };
            return this.seasonRepo.findByIdAndUpdate$(id!, update);
          } else {
            return of(dbSeason);
          }
        }),
      )
      .toPromise();
  }
}
