import { from, Observable, forkJoin, throwError } from 'rxjs';
import { flatMap } from 'rxjs/operators';
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
  getAllBySeason$(seasonId: string | undefined): Observable<Team[]>;
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

  getAllBySeason$(seasonId: string | undefined): Observable<Team[]> {
    if (!seasonId) {
      throwError('seasonId cannot be empty');
    }
    return from(
      new Promise(
        (
          resolve: (value?: Team[]) => void,
          reject: (reason?: Error) => void,
        ) => {
          SeasonModel.findOne({ _id: seasonId })
            .populate('teams', '-__v -externalReference')
            .lean()
            .exec(function(err, season) {
              if (err) reject(err);
              if (!season)
                reject(new Error('Failed to find Season ' + seasonId));
              return resolve(season.teams as Team[]);
            });
        },
      ),
    );
  }

  public findByNameAndUpsert$(name: any, obj?: any): Observable<Team> {
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
