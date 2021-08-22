import { Observable, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import MatchModel, {
  Match,
  MatchDocument,
  MatchStatus,
} from '../models/match.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  MatchConverter,
  MatchConverterImpl,
} from '../converters/match.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface MatchRepository extends BaseFootballApiRepository<Match> {
  findSelectableMatches$(
    seasonId: string,
    gameRound: string,
  ): Observable<Match[]>;
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<Match>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<Match[]>;
  findAllFinishedWithPendingPredictions$(
    seasonId: string,
    gameRound?: string,
  ): Observable<Match[]>;
}

export class MatchRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Match, MatchDocument>
  implements MatchRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): MatchRepository {
    return new MatchRepositoryImpl(MatchConverterImpl.getInstance(provider));
  }

  constructor(converter: MatchConverter) {
    super(MatchModel, converter);
  }

  public findSelectableMatches$(seasonId: string, gameRound: string) {
    const {
      SCHEDULED,
      TIMED,
      IN_PLAY,
      CANCELED,
      POSTPONED,
      FINISHED,
    } = MatchStatus;
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
    return (this.converter as MatchConverter).from(obj).pipe(
      flatMap(data => {
        const { season, homeTeam, awayTeam, gameRound, externalReference } = data;
        const query = {
          season,
          'homeTeam.id': homeTeam && homeTeam.id,
          'awayTeam.id': awayTeam && awayTeam.id,
        };
        delete data.externalReference;
        data.gameRound = gameRound;
        Object.keys(data).forEach(key => data[key] == null && delete data[key]);

        return this._findOneAndUpsert$(query, data, externalReference);
      }),
    );
  }

  public findEachBySeasonAndTeamsAndUpsert$(objs: any[]) {
    const obs: Array<Observable<Match>> = [];

    for (const obj of objs) {
      obs.push(this.findBySeasonAndTeamsAndUpsert$(obj));
    }
    return forkJoin(obs);
  }

  public findAllFinishedWithPendingPredictions$(
    seasonId: string,
    gameRound?: string,
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
