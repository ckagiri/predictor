import { Observable, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import {
  FixtureEntity,
  FixtureDocument,
  Fixture,
  FixtureStatus,
} from '../models/fixture.model';
import {
  BaseProviderRepository,
  BaseProviderRepositoryImpl,
} from './baseProvider.repo';
import {
  IFixtureConverter,
  FixtureConverter,
} from '../converters/fixture.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface FixtureRepository extends BaseProviderRepository<FixtureEntity> {
  findSelectableFixtures$(
    seasonId: string,
    gameRound: number,
  ): Observable<FixtureEntity[]>;
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<FixtureEntity>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<FixtureEntity[]>;
  findAllFinishedWithPendingPredictions$(
    seasonId: string,
    gameRound?: number,
  ): Observable<FixtureEntity[]>;
}

export class FixtureRepositoryImpl
  extends BaseProviderRepositoryImpl<FixtureEntity, FixtureDocument>
  implements FixtureRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): FixtureRepository {
    return new FixtureRepositoryImpl(FixtureConverter.getInstance(provider));
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
    const obs: Array<Observable<FixtureEntity>> = [];

    for (const obj of objs) {
      obs.push(this.findBySeasonAndTeamsAndUpsert$(obj));
    }
    return forkJoin(obs);
  }

  public findAllFinishedWithPendingPredictions$(
    seasonId: string,
    gameRound?: number,
  ) {
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
