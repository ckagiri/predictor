import { Observable, of } from "rxjs";

import { ILeague } from "../../models/league.model";
import { ILeagueConverter } from "../league.converter";
import { FootballApiProvider as ApiProvider } from "../../../common/footballApiProvider";

export class LeagueConverter implements ILeagueConverter {
  static getInstance(): ILeagueConverter {
    return new LeagueConverter();
  }
  provider: ApiProvider;

  constructor() {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  from(data: any): Observable<ILeague> {
    return of({
      name: data.name,
      code: data.code,
      slug: data.slug
    });
  }
}
