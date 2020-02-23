import { Observable, of } from 'rxjs';

import { TeamEntity } from '../../models/team.model';
import { TeamConverter } from '../team.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class AfdTeamConverter implements TeamConverter {
  public static getInstance(): TeamConverter {
    return new AfdTeamConverter();
  }
  public footballApiProvider: ApiProvider;

  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<TeamEntity> {
    return of({
      name: data.name,
      crestUrl: data.crestUrl,
      externalReference: {
        [this.footballApiProvider]: {
          id: data.id,
        },
      },
    });
  }
}
