import { Observable, of } from 'rxjs';

import { LeagueEntity } from '../../models/league.model';
import { LeagueConverter } from '../league.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiLeagueConverter implements LeagueConverter {
  public static getInstance(): LeagueConverter {
    return new LigiLeagueConverter();
  }
  public provider: ApiProvider;

  constructor() {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<LeagueEntity> {
    return of({
      ...data,
    });
  }
}
