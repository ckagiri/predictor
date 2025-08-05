import { map, Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Team } from '../../models/team.model.js';
import { TeamRepository } from '../../repositories/team.repo.js';
import { TeamConverter } from '../team.converter.js';

export class AfdTeamConverter implements TeamConverter {
  private teamRepo: TeamRepository | null = null;

  footballApiProvider: ApiProvider;

  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  static getInstance(): TeamConverter {
    return new AfdTeamConverter();
  }

  setTeamRepo(teamRepo: TeamRepository): void {
    this.teamRepo = teamRepo;
  }

  from(data: any): Observable<Team> {
    if (!this.teamRepo) {
      throw new Error('Team repository not set');
    }
    return this.teamRepo.findByName$(data.name).pipe(
      map(team => {
        return {
          ...team,
          crestUrl: data.crestUrl,
          externalReference: {
            [this.footballApiProvider]: {
              id: data.id,
            },
          },
        };
      })
    );
  }
}
