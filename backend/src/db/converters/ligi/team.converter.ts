import { Observable, of } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Team } from '../../models/team.model.js';
import { TeamConverter } from '../team.converter.js';

export class LigiTeamConverter implements TeamConverter {
  public footballApiProvider: ApiProvider;
  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public static getInstance(): TeamConverter {
    return new LigiTeamConverter();
  }

  public from(data: any): Observable<Team> {
    return of({ ...data });
  }
}
