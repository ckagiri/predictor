import { Observable, zip } from 'rxjs';

import { Match } from '../../models/match.model';
import { MatchConverter } from '../match.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../repositories/season.repo';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../repositories/team.repo';

export class LigiMatchConverter implements MatchConverter {
  public static getInstance(): MatchConverter {
    return new LigiMatchConverter(
      SeasonRepositoryImpl.getInstance(ApiProvider.LIGI),
      TeamRepositoryImpl.getInstance(ApiProvider.LIGI),
    );
  }

  public footballApiProvider: ApiProvider;

  constructor(
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
  ) {
    this.footballApiProvider = ApiProvider.LIGI;
  }

  public from(data: any): Observable<Match> {
    return zip(
      this.seasonRepo.findById$(data.seasonId),
      this.teamRepo.findById$(data.homeTeamId),
      this.teamRepo.findById$(data.awayTeamId),
      (season: any, homeTeam: any, awayTeam: any) => {
        return {
          ...data,
          season: season.id,
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
