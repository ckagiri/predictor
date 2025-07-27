import { Observable, of } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Season } from '../../models/season.model.js';
import { SeasonConverter } from '../season.converter.js';

export class AfdSeasonConverter implements SeasonConverter {
  public footballApiProvider: ApiProvider;
  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public static getInstance(): SeasonConverter {
    return new AfdSeasonConverter();
  }

  public from(data: any): Observable<Season> {
    const { currentSeason } = data;
    const { currentMatchday, endDate, id, startDate } = currentSeason;
    return of({
      currentMatchday: currentMatchday,
      externalReference: {
        [this.footballApiProvider]: {
          id,
        },
      },
      id: id,
      seasonEnd: endDate,
      seasonStart: startDate,
    });
  }
}
