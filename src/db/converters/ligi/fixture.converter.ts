import { Observable, zip } from "rxjs";

import { IFixture } from "../../models/fixture.model";
import { IFixtureConverter } from "../fixture.converter";
import { FootballApiProvider as ApiProvider } from "../../../common/footballApiProvider";
import {
  ISeasonRepository,
  SeasonRepository
} from "../../repositories/season.repo";
import { ITeamRepository, TeamRepository } from "../../repositories/team.repo";

export class FixtureConverter implements IFixtureConverter {
  static getInstance(): IFixtureConverter {
    return new FixtureConverter(
      SeasonRepository.getInstance(ApiProvider.LIGI),
      TeamRepository.getInstance(ApiProvider.LIGI)
    );
  }

  provider: ApiProvider;

  constructor(
    private seasonRepo: ISeasonRepository,
    private teamRepo: ITeamRepository
  ) {
    this.provider = ApiProvider.LIGI;
  }

  from(data: any): Observable<IFixture> {
    return zip(
      this.seasonRepo.findById$(data.seasonId),
      this.teamRepo.findById$(data.homeTeamId),
      this.teamRepo.findById$(data.awayTeamId),
      (season: any, homeTeam: any, awayTeam: any) => {
        return {
          season: season._id,
          date: new Date(data.date),
          matchRound: data.matchRound,
          gameRound: data.gameRound,
          status: data.status,
          homeTeam: {
            slug: homeTeam.slug,
            name: homeTeam.name,
            id: homeTeam._id,
            crestUrl: homeTeam.crestUrl
          },
          awayTeam: {
            slug: awayTeam.slug,
            name: awayTeam.name,
            id: awayTeam._id,
            crestUrl: awayTeam.crestUrl
          },
          slug: `${homeTeam.slug}-${awayTeam.slug}`,
          result: {
            goalsHomeTeam: data.result.goalsHomeTeam,
            goalsAwayTeam: data.result.goalsAwayTeam
          },
          odds: data.odds
        };
      }
    );
  }

  map(data: any[]): any[] {
    return data;
  }
}
