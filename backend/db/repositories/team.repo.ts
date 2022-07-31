import { from, Observable, forkJoin, throwError, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { merge } from 'lodash';
import TeamModel, { Team, TeamDocument } from '../models/team.model';
import SeasonModel from '../models/season.model';
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
  getAllBySeason$(seasonId?: string): Observable<Team[]>;
}

export class TeamRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Team, TeamDocument>
  implements TeamRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): TeamRepository {
    return new TeamRepositoryImpl(TeamConverterImpl.getInstance(provider));
  }

  constructor(converter: TeamConverter) {
    super(TeamModel, converter);
  }

  public getAllBySeason$(seasonId?: string): Observable<Team[]> {
    if (!seasonId) {
      return throwError(() => 'seasonId cannot be empty');
    }
    return from(
      new Promise(
        (
          resolve: (value?: Team[]) => void,
          reject: (reason?: Error) => void,
        ) => {
          // Todo: inject season-repo or team-repo
          SeasonModel.findOne({ _id: seasonId })
            .populate('teams', '-__v -externalReference')
            .exec((err, season) => {
              if (err) { reject(err); }
              if (!season) {
                reject(new Error('Failed to find Season ' + seasonId));
              }
              return resolve(season?.teams as any[]);
            });
        },
      ) as Promise<Team[]>,
    );
  }

  public findByNameAndUpsert$(obj: any): Observable<Team> {
    const name = obj.name;
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };

    return (this.converter as TeamConverter).from(obj).pipe(
      mergeMap(data => {
        const { externalReference } = data;
        delete data.externalReference;
        // todo: remove nils from object

        return this.findOneAndUpsert$(query, data)
          .pipe(
            mergeMap((team: Team) => {
              if (externalReference === undefined) {
                return of(team);
              }
              merge(team, { externalReference });
              return this.insert$(team);
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
