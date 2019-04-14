import { Observable, zip } from "rxjs";

import { IFixtureConverter } from "../fixture.converter";
import { FootballApiProvider as ApiProvider } from "../../../common/footballApiProvider";
import {
  ISeasonRepository,
  SeasonRepository
} from "../../repositories/season.repo";
import { ITeamRepository, TeamRepository } from "../../repositories/team.repo";
import { IFixture } from "../../models/fixture.model";
import { ISeason } from "../../models/season.model";
import { ITeam } from "../../models/team.model";

export class FixtureConverter implements IFixtureConverter {
  static getInstance(): IFixtureConverter {
    return new FixtureConverter(
      SeasonRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA)
    );
  }
  provider: ApiProvider;

  constructor(
    private seasonRepo: ISeasonRepository,
    private teamRepo: ITeamRepository
  ) {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  from(data: any): Observable<IFixture> {
    return zip(
      this.seasonRepo.findByExternalId$(data.competitionId),
      this.teamRepo.findByName$(data.homeTeamName),
      this.teamRepo.findByName$(data.awayTeamName),
      (season: ISeason, homeTeam: ITeam, awayTeam: ITeam) => {
        return {
          ...data,
          season: season.id,
          matchRound: data.matchday,
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
