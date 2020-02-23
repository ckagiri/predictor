import { Observable, of } from 'rxjs';

import { CompetitionEntity } from '../../models/competition.model';
import { CompetitionConverter } from '../competition.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiCompetitionConverter implements CompetitionConverter {
  public static getInstance(): CompetitionConverter {
    return new LigiCompetitionConverter();
  }
  public provider: ApiProvider;

  constructor() {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<CompetitionEntity> {
    return of({
      ...data,
    });
  }
}
