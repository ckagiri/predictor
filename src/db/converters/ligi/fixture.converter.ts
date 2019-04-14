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
          ...data,
          season: season.id,
          homeTeam: {
            id: homeTeam.id!.toString(),
            slug: homeTeam.slug,
            name: homeTeam.name,
            crestUrl: homeTeam.crestUrl!.toString()
          },
          awayTeam: {
            id: awayTeam.id!.toString(),
            slug: awayTeam.slug,
            name: awayTeam.name,
            crestUrl: awayTeam.crestUrl!.toString()
          },
          slug: `${homeTeam.slug}-${awayTeam.slug}`
        };
      }
    );
  }

  map(data: any[]): any[] {
    return data;
  }
}
