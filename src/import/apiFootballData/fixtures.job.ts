import { from } from "rxjs";
import { flatMap } from "rxjs/operators";
import { IJob } from "../jobs/job";
import { Queue } from "../queue";
import { IFootballApiClient } from "../../thirdParty/footballApi/apiClient";
import { IFixtureRepository } from "../../db/repositories/fixture.repo";
import Builder from "./fixturesJob.builder";

export class FixturesJob implements IJob {
  private competitionId: number | string;
  private apiClient: IFootballApiClient;
  private fixtureRepo: IFixtureRepository;

  constructor(builder: Builder) {
    this.apiClient = builder.ApiClient;
    this.fixtureRepo = builder.FixtureRepo;
    this.competitionId = builder.CompetitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log("** starting ApiFootballData Fixtures job");
    return from(this.apiClient.getFixtures(this.competitionId))
      .pipe(
        flatMap((response: any) => {
          const fixtures = response.data.matches;
          return this.fixtureRepo.findEachBySeasonAndTeamsAndUpsert$(fixtures);
        })
      )
      .toPromise();
  }
}
