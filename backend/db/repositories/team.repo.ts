import { Observable, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { TeamEntity, TeamDocument, Team } from '../models/team.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import { TeamConverter, TeamConverterImpl } from '../converters/team.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface TeamRepository extends BaseFootballApiRepository<TeamEntity> {
  findByNameAndUpsert$(name: any, obj?: any): Observable<TeamEntity>;
  findEachByNameAndUpsert$(teams: any[]): Observable<TeamEntity[]>;
  findByName$(name: string): Observable<TeamEntity>;
}

export class TeamRepositoryImpl
  extends BaseFootballApiRepositoryImpl<TeamEntity, TeamDocument>
  implements TeamRepository {
  public static getInstance(provider: ApiProvider): TeamRepository {
    return new TeamRepositoryImpl(TeamConverterImpl.getInstance(provider));
  }

  constructor(converter: TeamConverter) {
    super(Team, converter);
  }

  public findByNameAndUpsert$(name: any, obj?: any): Observable<TeamEntity> {
    let partialUpdate = true;
    if (obj === undefined) {
      obj = name;
      name = obj.name;
      partialUpdate = false;
    }
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };
    if (partialUpdate) {
      return super.findOneAndUpdate$(query, obj);
    }
    return (this.converter as TeamConverter).from(obj).pipe(
      flatMap(data => {
        const { externalReference } = data;
        delete obj.externalReference;
        return this._findOneAndUpsert$(query, obj, externalReference);
      }),
    );
  }

  public findEachByNameAndUpsert$(teams: any[]): Observable<TeamEntity[]> {
    const obs: Array<Observable<TeamEntity>> = [];

    for (const team of teams) {
      obs.push(this.findByNameAndUpsert$(team));
    }
    return forkJoin(obs);
  }

  public findByName$(name: string): Observable<TeamEntity> {
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };
    return this.findOne$(query);
  }
}
