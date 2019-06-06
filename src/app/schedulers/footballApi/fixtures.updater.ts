import { from, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { IFixture } from '../../../db/models/fixture.model';
import { IFixtureRepository, FixtureRepository } from '../../../db/repositories/fixture.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export interface IFixturesUpdater {
  updateGameDetails(apiFixtures: any[]): Promise<IFixture>;
}

const fixtureChanged = (apiFixture: any, dbFixture: IFixture) => {
  if (apiFixture.status !== dbFixture.status) {
    return true;
  }

  if (
    apiFixture.result.goalsHomeTeam !== dbFixture!.result!.goalsHomeTeam ||
    apiFixture.result.goalsAwayTeam !== dbFixture!.result!.goalsAwayTeam
  ) {
    return true;
  }

  if (
    (apiFixture.odds && apiFixture.odds.homeWin) !== dbFixture!.odds!.homeWin ||
    (apiFixture.odds && apiFixture.odds.awayWin) !== dbFixture!.odds!.awayWin ||
    (apiFixture.odds && apiFixture.odds.draw) !== dbFixture!.odds!.draw
  ) {
    return true;
  }

  return false;
};

export class FixturesUpdater implements IFixturesUpdater {
  static getInstance(provider: ApiProvider) {
    return new FixturesUpdater(FixtureRepository.getInstance(provider));
  }

  constructor(private fixtureRepo: IFixtureRepository) {}

  updateGameDetails(apiFixtures: any[]) {
    const externalIdToApiFixtureMap: any = new Map<string, any>();
    const externalIds: string[] = [];
    for (const apiFixture of apiFixtures) {
      externalIdToApiFixtureMap[apiFixture.id] = apiFixture;
      externalIds.push(apiFixture.id);
    }
    return this.fixtureRepo
      .findByExternalIds$(externalIds)
      .pipe(
        flatMap(dbFixtures => {
          return from(dbFixtures);
        })
      )
      .pipe(
        flatMap(dbFixture => {
          const provider = this.fixtureRepo.Provider;
          const extId = dbFixture.externalReference[provider].id;
          const apiFixture = externalIdToApiFixtureMap[extId];

          if (fixtureChanged(apiFixture, dbFixture)) {
            const id = dbFixture.id;
            const { result, status, odds } = apiFixture;
            const update: any = { result, status, odds };
            Object.keys(update).forEach(key => update[key] == null && delete update[key]);
            return this.fixtureRepo.findByIdAndUpdate$(id!, update);
          }
          return of(dbFixture);
        })
      )
      .toPromise();
  }
}
