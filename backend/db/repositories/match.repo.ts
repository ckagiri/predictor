import { Observable, forkJoin, from, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { get, merge, omit } from 'lodash';

import MatchModel, {
  Match,
  MatchStatus,
} from '../models/match.model';
import { Competition } from '../models/competition.model';
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
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<Match>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<Match[]>;
  find$(query: any, projection?: any, options?: any): Observable<{ result: Match[]; count: number }>;
  findAllFinishedForCurrentSeasons$(competitions: Competition[], filter: any): Observable<[string, Match[]]>
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

  findAllFinishedForCurrentSeasons$(competitions: Competition[], filter: any = {}): Observable<[string, Match[]]> {
    type SeasonToMatches = [string, Match[]]
    return from(competitions)
      .pipe(
        mergeMap(competition => {
          const currentSeason = competition.currentSeason?.toString();
          if (currentSeason) {
            return this.findAll$({ ...filter, season: currentSeason, status: MatchStatus.FINISHED })
              .pipe(
                map(matches => {
                  const result: SeasonToMatches = [currentSeason!, matches]
                  return result;
                })
              )
          } else {
            const result: SeasonToMatches = ['', []];
            return of(result)
          }
        })
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
