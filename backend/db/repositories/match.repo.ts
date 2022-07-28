import { Observable, forkJoin, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { get, merge, omit } from 'lodash';

import MatchModel, {
  Match,
  MatchDocument,
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
import { SeasonRepository, SeasonRepositoryImpl } from './season.repo';

export interface MatchRepository extends BaseFootballApiRepository<Match> {
  findBySeasonAndTeamsAndUpsert$(obj: any): Observable<Match>;
  findEachBySeasonAndTeamsAndUpsert$(objs: any[]): Observable<Match[]>;
  find$(query: any, projection?: any, options?: any): Observable<{ result: Match[]; count: number }>;
  findAllFinishedForCurrentSeasons(): Observable<Match[]>
}
export class MatchRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Match, MatchDocument>
  implements MatchRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
    seasonRepoImpl: SeasonRepository = SeasonRepositoryImpl.getInstance(provider)
  ): MatchRepository {
    return new MatchRepositoryImpl(MatchConverterImpl.getInstance(provider), seasonRepoImpl);
  }

  constructor(converter: MatchConverter, private seasonRepo: SeasonRepository) {
    super(MatchModel, converter);
  }

  findAllFinishedForCurrentSeasons(): Observable<Match[]> {
    return this.seasonRepo.findAll$({ isCurrent: true })
      .pipe(
        mergeMap(seasons => from(seasons)),
        mergeMap(season => {
          return this.findAll$({ season: season.id })
        })
      );
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

        return this.findOneAndUpsert$(query, obj)
          .pipe(
            mergeMap((match: Match) => {
              if (externalReference === undefined) {
                return of(match);
              }
              merge(match, { externalReference });
              return this.insert$(match);
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
