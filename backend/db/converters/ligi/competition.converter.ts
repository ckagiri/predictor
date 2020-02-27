import { Observable, of } from 'rxjs';

import { CompetitionModel } from '../../models/competition.model';
import { CompetitionConverter } from '../competition.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiCompetitionConverter implements CompetitionConverter {
  public static getInstance(): CompetitionConverter {
    return new LigiCompetitionConverter();
  }
  public footballApiProvider: ApiProvider;

  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<CompetitionModel> {
    return of({
      ...data,
    });
  }
}
