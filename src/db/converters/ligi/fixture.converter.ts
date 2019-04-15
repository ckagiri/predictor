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
            id: homeTeam.id!,
            name: homeTeam.name,
            slug: homeTeam.slug!,
            crestUrl: homeTeam.crestUrl!
          },
          awayTeam: {
            id: awayTeam.id!,
            name: awayTeam.name,
            slug: awayTeam.slug!,
            crestUrl: awayTeam.crestUrl!
          },
          slug: `${homeTeam.slug}-${awayTeam.slug}`,
          externalReference: {
            [this.provider]: {
              id: data.id
            }
          }
        };
      }
    );
  }

  map(data: any[]): any[] {
    return data;
  }
}
