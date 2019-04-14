import { Observable, forkJoin } from "rxjs";
import { flatMap } from "rxjs/operators";
import { ITeam, ITeamDocument, Team } from "../models/team.model";
import {
  IBaseProviderRepository,
  BaseProviderRepository
} from "./baseProvider.repo";
import { ITeamConverter, TeamConverter } from "../converters/team.converter";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ITeamRepository extends IBaseProviderRepository<ITeam> {
  findByNameAndUpsert$(name: any, obj?: any): Observable<ITeam>;
  findEachByNameAndUpsert$(objs: any[]): Observable<ITeam[]>;
  findByName$(name: string): Observable<ITeam>;
}

export class TeamRepository extends BaseProviderRepository<ITeam, ITeamDocument>
  implements ITeamRepository {
  static getInstance(provider: ApiProvider): ITeamRepository {
    return new TeamRepository(TeamConverter.getInstance(provider));
  }

  constructor(converter: ITeamConverter) {
    super(Team, converter);
  }

  findByNameAndUpsert$(name: any, obj?: any): Observable<ITeam> {
    let partialUpdate = true;
    if (obj === undefined) {
      obj = name;
      name = obj.name;
      partialUpdate = false;
    }
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }]
    };
    if (partialUpdate) {
      return super.findOneAndUpdate$(query, obj);
    }
    return this.converter.from(obj).pipe(
      flatMap((data: any) => {
        const { externalReference } = data;
        delete obj.externalReference;
        return this._findOneAndUpsert$(query, obj, externalReference);
      })
    );
  }

  findEachByNameAndUpsert$(objs: any[]): Observable<ITeam[]> {
    const obs: any[] = [];

    for (const obj of objs) {
      obs.push(this.findByNameAndUpsert$(obj));
    }
    return forkJoin(obs);
  }

  findByName$(name: string): Observable<ITeam> {
    const query = {
      $or: [{ name }, { shortName: name }, { aliases: name }]
    };
    return this.findOne$(query);
  }
}
