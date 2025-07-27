import { Observable, of } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Competition } from '../../models/competition.model.js';
import { CompetitionConverter } from '../competition.converter.js';

export class LigiCompetitionConverter implements CompetitionConverter {
  public footballApiProvider: ApiProvider;
  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public static getInstance(): CompetitionConverter {
    return new LigiCompetitionConverter();
  }

  public from(data: any): Observable<Competition> {
    return of({
      ...data,
    });
  }
}
