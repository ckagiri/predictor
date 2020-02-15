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
    const { currentSeason } = data;
    const { id, currentMatchday, startDate, endDate } = currentSeason;
    return of({
      currentMatchRound: currentMatchday,
      seasonStart: startDate,
      seasonEnd: endDate,
      externalReference: {
        [this.provider]: {
          id
        }
      }
    });
  }
}
