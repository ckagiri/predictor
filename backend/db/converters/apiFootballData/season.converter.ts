import { Observable, of } from 'rxjs';

import { SeasonModel } from '../../models/season.model';
import { SeasonConverter } from '../season.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class AfdSeasonConverter implements SeasonConverter {
  public static getInstance(): SeasonConverter {
    return new AfdSeasonConverter();
  }
  public footballApiProvider: ApiProvider;

  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<SeasonModel> {
    const { currentSeason } = data;
    const { id, currentMatchday, startDate, endDate } = currentSeason;
    return of({
      currentMatchRound: currentMatchday,
      seasonStart: startDate,
      seasonEnd: endDate,
      externalReference: {
        [this.footballApiProvider]: {
          id,
        },
      },
    });
  }
}
