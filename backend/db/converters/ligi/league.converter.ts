import { Observable, of } from 'rxjs';

import { LeagueEntity } from '../../models/league.model';
import { ILeagueConverter } from '../league.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LeagueConverter implements ILeagueConverter {
  public static getInstance(): ILeagueConverter {
    return new LeagueConverter();
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
