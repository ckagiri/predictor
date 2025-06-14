import { merge } from 'lodash';
import { forkJoin, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import {
  TeamConverter,
  TeamConverterImpl,
} from '../converters/team.converter.js';
import TeamModel, { Team } from '../models/team.model.js';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo.js';

export interface TeamRepository extends BaseFootballApiRepository<Team> {
  findByName$(name: string): Observable<Team | null>;
  findByNameAndUpsert$(name: any, obj?: any): Observable<Team>;
  findEachByNameAndUpsert$(teams: any[]): Observable<Team[]>;
}

export class TeamRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Team>
  implements TeamRepository
{
  constructor(converter: TeamConverter) {
    super(TeamModel, converter);
  }

  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI
  ): TeamRepository {
    return new TeamRepositoryImpl(TeamConverterImpl.getInstance(provider));
  }

  public findByName$(name: string): Observable<Team | null> {
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };
    return this.findOne$(query);
  }

  public findByNameAndUpsert$(obj: any): Observable<Team> {
    return (this.converter as TeamConverter).from(obj).pipe(
      mergeMap(data => {
        const name = data.name;
        const query = {
          $or: [{ name }, { shortName: name }, { aliases: name }],
        };
        delete data.name;
        const { externalReference } = data;
        delete data.externalReference;
        data = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null)
        );

        return this.findOneAndUpsert$(query, data).pipe(
          mergeMap((team: Team) => {
            merge(team, { externalReference });
            return this.findOneAndUpdate$(query, team);
          })
        );
      })
    );
  }

  public findEachByNameAndUpsert$(teams: any[]): Observable<Team[]> {
    const obs: Observable<Team>[] = [];

    for (const team of teams) {
      obs.push(this.findByNameAndUpsert$(team));
    }
    return forkJoin(obs);
  }
}
