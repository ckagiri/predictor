import { get, merge, omit } from 'lodash';
import { forkJoin, from, Observable } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { Season } from '../../db/models/season.model.js';
import {
  MatchConverter,
  MatchConverterImpl,
} from '../converters/match.converter.js';
import MatchModel, { Match, MatchStatus } from '../models/match.model.js';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo.js';

export interface MatchRepository extends BaseFootballApiRepository<Match> {
  find$(
    query: any,
    projection?: any,
    options?: any
  ): Observable<{ count: number; result: Match[] }>;
  findAllFinishedByCurrentRound$(
    seasons: Season[]
  ): Observable<[string, Match[]][]>;
  findAllFinishedBySeason$(
    seasons: string[],
    filter?: any
  ): Observable<[string, Match[]][]>;
  findAllFinishedForSeason$(season: string, filter?: any): Observable<Match[]>;
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<Match>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<Match[]>;
}

export class MatchRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Match>
  implements MatchRepository
{
  constructor(converter: MatchConverter) {
    super(MatchModel, converter);
  }

  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI
  ): MatchRepository {
    return new MatchRepositoryImpl(MatchConverterImpl.getInstance(provider));
  }

  findAllFinishedByCurrentRound$(
    seasons: Season[]
  ): Observable<[string, Match[]][]> {
    type SeasonToMatches = [string, Match[]];
    return from(seasons).pipe(
      mergeMap(season => {
        const seasonId = season.id!;
        const gameRound = season.currentGameRound;
        return this.findAll$({ gameRound }).pipe(
          map(matches => {
            const result: SeasonToMatches = [seasonId, matches];
            return result;
          })
        );
      }),
      toArray()
    );
  }

  findAllFinishedBySeason$(
    seasons: string[],
    filter: any = {}
  ): Observable<[string, Match[]][]> {
    type SeasonToMatches = [string, Match[]];
    return from(seasons).pipe(
      mergeMap(season => {
        return this.findAll$({
          ...filter,
          season,
          status: MatchStatus.FINISHED,
        }).pipe(
          map(matches => {
            const result: SeasonToMatches = [season, matches];
            return result;
          })
        );
      }),
      toArray()
    );
  }

  findAllFinishedForSeason$(
    season: string,
    filter: any = {}
  ): Observable<Match[]> {
    return this.findAll$({ ...filter, season, status: MatchStatus.FINISHED });
  }

  public findBySeasonAndTeamsAndUpsert$(obj: any) {
    return (this.converter as MatchConverter).from(obj).pipe(
      mergeMap(data => {
        const { awayTeam, externalReference, homeTeam, season } = data;
        const query = {
          'awayTeam.id': awayTeam?.id,
          'homeTeam.id': homeTeam?.id,
          season,
        };
        delete data.externalReference;
        const cleanedData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value != null)
        );

        return this.findOneAndUpsert$(query, cleanedData).pipe(
          mergeMap((match: Match) => {
            merge(match, { externalReference });
            return this.findOneAndUpdate$(query, match);
          })
        );
      })
    );
  }

  public findEachBySeasonAndTeamsAndUpsert$(objs: any[]) {
    const obs: Observable<Match>[] = [];

    for (const obj of objs) {
      obs.push(this.findBySeasonAndTeamsAndUpsert$(obj));
    }
    return forkJoin(obs);
  }
}
