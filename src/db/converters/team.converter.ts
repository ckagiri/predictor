import { Observable } from "rxjs";

import { TeamConverter as LigiTeamConverter } from "../converters/ligi/team.converter";
import { TeamConverter as AfdTeamConverter } from "../converters/apiFootballData/team.converter";
import { IConverter } from "./converter";
import { ITeam } from "../models/team.model";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ITeamConverter extends IConverter {
  from(data: any): Observable<ITeam>;
}

export abstract class TeamConverter {
  static getInstance(provider: ApiProvider): ITeamConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiTeamConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdTeamConverter.getInstance();
      default:
        throw new Error("Converter for Provider does not exist");
    }
  }
}
