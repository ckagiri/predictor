import { Observable, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import {
  IFixture,
  IFixtureDocument,
  Fixture,
  FixtureStatus,
} from '../models/fixture.model';
import {
  IBaseProviderRepository,
  BaseProviderRepository,
} from './baseProvider.repo';
import {
  IFixtureConverter,
  FixtureConverter,
} from '../converters/fixture.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface IFixtureRepository extends IBaseProviderRepository<IFixture> {
  findSelectableFixtures$(
    seasonId: string,
    gameRound: number,
  ): Observable<IFixture[]>;
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<IFixture>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<IFixture[]>;
  findAllFinishedWithPendingPredictions$(
    seasonId: string,
    gameRound?: number,
  ): Observable<IFixture[]>;
}

export class FixtureRepository
  extends BaseProviderRepository<IFixture, IFixtureDocument>
  implements IFixtureRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): IFixtureRepository {
    return new FixtureRepository(FixtureConverter.getInstance(provider));
  }

  constructor(converter: IFixtureConverter) {
    super(Fixture, converter);
  }

  public findSelectableFixtures$(seasonId: string, gameRound: number) {
    const {
      SCHEDULED,
      TIMED,
      IN_PLAY,
      CANCELED,
      POSTPONED,
      FINISHED,
    } = FixtureStatus;
    const query = {
      $or: [
        {
          $and: [
            { season: seasonId },
            { gameRound },
            { status: { $in: [SCHEDULED, TIMED, IN_PLAY] } },
          ],
        },
        {
          $and: [
            { season: seasonId },
            { gameRound },
            { status: { $in: [CANCELED, POSTPONED, FINISHED] } },
            { allPredictionsProcessed: false },
          ],
        },
      ],
    };

    return this.findAll$(query, null, { sort: 'date' });
  }

  public findBySeasonAndTeamsAndUpsert$(obj: any) {
    return (this.converter as IFixtureConverter).from(obj).pipe(
      flatMap(data => {
        const { season, homeTeam, awayTeam, externalReference } = data;
        const query = {
          season,
          'homeTeam.id': homeTeam && homeTeam.id,
          'awayTeam.id': awayTeam && awayTeam.id,
        };
        delete data.externalReference;
        Object.keys(data).forEach(key => data[key] == null && delete data[key]);

        return this._findOneAndUpsert$(query, data, externalReference);
      }),
    );
  }

  public findEachBySeasonAndTeamsAndUpsert$(objs: any[]) {
    const obs: any[] = [];

    for (const obj of objs) {
      obs.push(this.findBySeasonAndTeamsAndUpsert$(obj));
    }
    return forkJoin(obs);
  }

  public findAllFinishedWithPendingPredictions$(seasonId: string, gameRound?: number) {
    const query: any = {
      $and: [
        { season: seasonId },
        { allPredictionsProcessed: false },
        { status: { $in: ['CANCELED', 'POSTPONED', 'FINISHED'] } },
      ],
    };
    if (gameRound) {
      query.$and.push({ gameRound });
    }
    return this.findAll$(query);
  }
}
