import { Observable, zip } from 'rxjs';

import { IFixtureConverter } from '../fixture.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import {
  ISeasonRepository,
  SeasonRepository,
} from '../../repositories/season.repo';
import { ITeamRepository, TeamRepository } from '../../repositories/team.repo';
import { IFixture } from '../../models/fixture.model';
import { ISeason } from '../../models/season.model';
import { ITeam } from '../../models/team.model';

export class FixtureConverter implements IFixtureConverter {
  public static getInstance(): IFixtureConverter {
    return new FixtureConverter(
      SeasonRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }
  public provider: ApiProvider;

  constructor(
    private seasonRepo: ISeasonRepository,
    private teamRepo: ITeamRepository,
  ) {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<IFixture> {
    return zip(
      this.seasonRepo.findByExternalId$(data.season.id),
      this.teamRepo.findByName$(data.homeTeam.name),
      this.teamRepo.findByName$(data.awayTeam.name),
      (season: ISeason, homeTeam: ITeam, awayTeam: ITeam) => {
        return {
          season: season.id,
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
            [this.provider]: {
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
