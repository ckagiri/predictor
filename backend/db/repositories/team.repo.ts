import { Observable, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { merge } from 'lodash';
import TeamModel, { Team } from '../models/team.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import { TeamConverter, TeamConverterImpl } from '../converters/team.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface TeamRepository extends BaseFootballApiRepository<Team> {
  findByNameAndUpsert$(name: any, obj?: any): Observable<Team>;
  findEachByNameAndUpsert$(teams: any[]): Observable<Team[]>;
  findByName$(name: string): Observable<Team>;
}

export class TeamRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Team>
  implements TeamRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): TeamRepository {
    return new TeamRepositoryImpl(TeamConverterImpl.getInstance(provider));
  }

  constructor(converter: TeamConverter) {
    super(TeamModel, converter);
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
                Object.keys(data).forEach(key => data[key] == null && delete data[key]);

        return this.findOneAndUpsert$(query, data)
          .pipe(
            mergeMap((team: Team) => {
              merge(team, { externalReference });
              return this.findOneAndUpdate$(query, team);
            })
          );
      })
    );
  }

  public findEachByNameAndUpsert$(teams: any[]): Observable<Team[]> {
    const obs: Array<Observable<Team>> = [];

    for (const team of teams) {
      obs.push(this.findByNameAndUpsert$(team));
    }
    return forkJoin(obs);
  }

  public findByName$(name: string): Observable<Team> {
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };
    return this.findOne$(query);
  }
}
