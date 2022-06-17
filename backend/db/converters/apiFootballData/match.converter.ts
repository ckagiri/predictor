import { Observable, zip } from 'rxjs';

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

import { Match } from '../../models/match.model';
import { Season } from '../../models/season.model';
import { Team } from '../../models/team.model';

export class AfdMatchConverter implements MatchConverter {
  public static getInstance(): MatchConverter {
    return new AfdMatchConverter(
      SeasonRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }
  public footballApiProvider: ApiProvider;

  constructor(
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
  ) {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<Match> {
    return zip(
      this.seasonRepo.findByExternalId$(data.season.id),
      this.teamRepo.findByName$(data.homeTeam.name),
      this.teamRepo.findByName$(data.awayTeam.name),
      (season: Season, homeTeam: Team, awayTeam: Team) => {
        return {
          season: season.id!,
          date: data.utcDate,
          matchRound: data.matchday,
          status: data.status,
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
          result: {
            goalsHomeTeam: data.score.fullTime.homeTeam,
            goalsAwayTeam: data.score.fullTime.awayTeam,
          },
          odds: data.odds,
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
