import { Observable, of } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Team } from '../../models/team.model.js';
import { TeamRepository } from '../../repositories/team.repo.js';
import { TeamConverter } from '../team.converter.js';

export class LigiTeamConverter implements TeamConverter {
  footballApiProvider: ApiProvider;
  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  // intentionally left blank as this converter does not use a TeamRepo.
  setTeamRepo(_teamRepo: TeamRepository): void {
    // no-op
  }

  static getInstance(): TeamConverter {
    return new LigiTeamConverter();
  }

  from(data: any): Observable<Team> {
    return of({ ...data });
  }
}
