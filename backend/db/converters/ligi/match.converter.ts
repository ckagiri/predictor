import { Observable, zip } from 'rxjs';

import { Match } from '../../models/match.model';
import { MatchConverter } from '../match.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../repositories/team.repo';

export class LigiMatchConverter implements MatchConverter {
  public static getInstance(): MatchConverter {
    return new LigiMatchConverter(
      TeamRepositoryImpl.getInstance(ApiProvider.LIGI),
    );
  }

  public footballApiProvider: ApiProvider;

  constructor(
    private teamRepo: TeamRepository,
  ) {
    this.footballApiProvider = ApiProvider.LIGI;
  }

  public from(data: any): Observable<Match> {
    return zip(
      this.teamRepo.findById$(data.homeTeamId),
      this.teamRepo.findById$(data.awayTeamId),
      (homeTeam: any, awayTeam: any) => {
        return {
          ...data,
          homeTeam: {
            id: homeTeam.id!,
            name: homeTeam.name,
            slug: homeTeam.slug!,
            crestUrl: homeTeam.crestUrl!,
          },
          awayTeam: {
            id: awayTeam.id!,
            name: awayTeam.name,
            slug: awayTeam.slug!,
            crestUrl: awayTeam.crestUrl!,
          },
          slug: `${homeTeam.slug}-v-${awayTeam.slug}`,
          externalReference: {
            [this.footballApiProvider]: {
              id: data.id,
            },
          },
        };
      },
    );
  }

  public map(data: any[]): any[] {
    return data;
  }
}
