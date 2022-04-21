import { from, Observable, forkJoin, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
          SeasonModel.findOne({ _id: seasonId })
            .populate('teams', '-__v -externalReference')
            .lean()
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

  public findByNameAndUpsert$(name: any, obj?: any): Observable<Team> {
    // we call this method by passing an api team object or name & patch
    // if a patch is not passed then I call it a partial update not sure why -- this not clear
    // also when patch is not passed treat the object as an api object therefore need to convert
    let partialUpdate = true;
    if (obj === undefined) {
      partialUpdate = false;
      // maintain call structure (name, object) even though only object was passed in
      obj = name;
      name = obj.name;
    }
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }],
    };
    if (partialUpdate) {
      return super.findOneAndUpdate$(query, obj);
    }
    return (this.converter as TeamConverter).from(obj).pipe(
      mergeMap(data => {
        const { externalReference } = data;
        delete obj.externalReference;
        // todo: this is a special method to deal with mixed type for externalReference 
        // to avoid overwritting existing keys
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
