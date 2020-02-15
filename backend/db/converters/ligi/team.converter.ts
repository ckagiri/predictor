import { Observable, of } from 'rxjs';

import { ITeam } from '../../models/team.model';
import { ITeamConverter } from '../team.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class TeamConverter implements ITeamConverter {
  public static getInstance(): ITeamConverter {
    return new TeamConverter();
  }
  public provider: ApiProvider;

  constructor() {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<ITeam> {
    return of({ ...data });
  }
}
