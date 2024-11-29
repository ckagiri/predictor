import { Observable, forkJoin, from } from 'rxjs';
import { mergeMap, map, toArray } from 'rxjs/operators';
import { get, merge, omit } from 'lodash';

import MatchModel, {
  Match,
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
import { Season } from '../../db/models/season.model';

export interface MatchRepository extends BaseFootballApiRepository<Match> {
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<Match>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<Match[]>;
  find$(query: any, projection?: any, options?: any): Observable<{ result: Match[]; count: number }>;
  findAllFinishedBySeason$(seasons: string[], filter?: any): Observable<[string, Match[]][]>
  findAllFinishedForSeason$(season: string, filter?: any): Observable<Match[]>
  findAllFinishedByCurrentRound$(seasons: Season[]): Observable<[string, Match[]][]>
}

export class MatchRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Match>
  implements MatchRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): MatchRepository {
    return new MatchRepositoryImpl(MatchConverterImpl.getInstance(provider));
  }

  constructor(converter: MatchConverter) {
    super(MatchModel, converter);
  }

  findAllFinishedBySeason$(seasons: string[], filter: any = {}): Observable<[string, Match[]][]> {
    type SeasonToMatches = [string, Match[]]
    return from(seasons)
      .pipe(
        mergeMap(season => {
          return this.findAll$({ ...filter, season, status: MatchStatus.FINISHED })
            .pipe(
              map(matches => {
                const result: SeasonToMatches = [season, matches]
                return result;
              })
            )
        }),
        toArray()
      )
  }

  findAllFinishedForSeason$(season: string, filter: any = {}): Observable<Match[]> {
    return this.findAll$({ ...filter, season, status: MatchStatus.FINISHED })
  }

  findAllFinishedByCurrentRound$(seasons: Season[]): Observable<[string, Match[]][]> {
    type SeasonToMatches = [string, Match[]]
    return from(seasons)
      .pipe(
        mergeMap(season => {
          const seasonId = season.id!;
          const gameRound = season.currentGameRound;
          return this.findAll$({ gameRound })
            .pipe(
              map(matches => {
                const result: SeasonToMatches = [seasonId, matches];
                return result;
              })
            )
        }),
        toArray()
      )
  }


  public findBySeasonAndTeamsAndUpsert$(obj: any) {
    return (this.converter as MatchConverter).from(obj).pipe(
      mergeMap(data => {
        const { season, homeTeam, awayTeam, externalReference } = data;
        const query = {
          season,
          'homeTeam.id': homeTeam && homeTeam.id,
          'awayTeam.id': awayTeam && awayTeam.id,
        };
        delete data.externalReference;
        Object.keys(data).forEach(key => data[key] == null && delete data[key]);

        return this.findOneAndUpsert$(query, data)
          .pipe(
            mergeMap((match: Match) => {
              merge(match, { externalReference });
              return this.findOneAndUpdate$(query, match);
            }),
          );
      })
    );
  }

  public findEachBySeasonAndTeamsAndUpsert$(objs: any[]) {
    const obs: Array<Observable<Match>> = [];

    for (const obj of objs) {
      obs.push(this.findBySeasonAndTeamsAndUpsert$(obj));
    }
    return forkJoin(obs);
  }

  public find$(query?: any, projection?: any, options?: any) {
    let { filter } = query;
    const teamId = get(filter, 'team.id');
    if (teamId) {
      filter = omit(filter, 'team.id')
      filter['criteria'] = { $or: [{ 'homeTeam.id': teamId }, { 'awayTeam.id': teamId }] };
      query.filter = filter;
    }
    return super.find$(query, projection, options);
  }
}
