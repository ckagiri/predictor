import { Observable, of } from "rxjs";

import { ISeason } from "../../models/season.model";
import { ISeasonConverter } from "../season.converter";
import { FootballApiProvider as ApiProvider } from "../../../common/footballApiProvider";

export class SeasonConverter implements ISeasonConverter {
  static getInstance(): ISeasonConverter {
    return new SeasonConverter();
  }
  provider: ApiProvider;

  constructor() {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  from(data: any): Observable<ISeason> {
    return of({
      name: data.caption,
      year: data.year,
      currentMatchRound: data.currentMatchday,
      numberOfRounds: data.numberOfMatchdays,
      numberOfTeams: data.numberOfTeams,
      numberOfGames: data.numberOfGames,
      externalReference: {
        [this.provider]: {
          id: data.id
        }
      }
    });
  }
}
