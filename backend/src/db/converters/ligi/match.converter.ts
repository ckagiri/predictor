import { Observable, zip } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Match } from '../../models/match.model.js';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../repositories/team.repo.js';
import { MatchConverter } from '../match.converter.js';

export class LigiMatchConverter implements MatchConverter {
  public footballApiProvider: ApiProvider;

  constructor(private teamRepo: TeamRepository) {
    this.footballApiProvider = ApiProvider.LIGI;
  }

  public static getInstance(): MatchConverter {
    return new LigiMatchConverter(
      TeamRepositoryImpl.getInstance(ApiProvider.LIGI)
    );
  }

  public from(data: any): Observable<Match> {
    return zip(
      this.teamRepo.findById$(data.homeTeamId),
      this.teamRepo.findById$(data.awayTeamId),
      (homeTeam: any, awayTeam: any) => {
        return {
          ...data,
          awayTeam: {
            crestUrl: awayTeam.crestUrl!,
            id: awayTeam.id!,
            name: awayTeam.name,
            slug: awayTeam.slug!,
          },
          homeTeam: {
            crestUrl: homeTeam.crestUrl!,
            id: homeTeam.id!,
            name: homeTeam.name,
            slug: homeTeam.slug!,
          },
          slug: `${String(homeTeam.tla).toLowerCase()}-${String(awayTeam.tla).toLowerCase()}`,
        };
      }
    );
  }

  public map(data: any[]): any[] {
    return data;
  }
}
