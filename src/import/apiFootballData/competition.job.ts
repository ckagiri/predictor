import { from } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { IJob } from "../jobs/job";
import { Queue } from "../queue";
import { IFootballApiClient } from "../../thirdParty/footballApi/apiClient";
import { ISeasonRepository } from "../../db/repositories/season.repo";
import { ITeamRepository } from "../../db/repositories/team.repo";
import { IFixtureRepository } from "../../db/repositories/fixture.repo";
import { FixturesJob } from "./fixtures.job";
import { TeamsJob } from "./teams.job";
import Builder from "./competitionJob.builder";

export class CompetitionJob implements IJob {
  private competitionId: number | string;
  private apiClient: IFootballApiClient;
  private seasonRepo: ISeasonRepository;
  private teamRepo: ITeamRepository;
  private fixtureRepo: IFixtureRepository;

  constructor(builder: Builder) {
    this.apiClient = builder.ApiClient;
    this.seasonRepo = builder.SeasonRepo;
    this.teamRepo = builder.TeamRepo;
    this.fixtureRepo = builder.FixtureRepo;
    this.competitionId = builder.CompetitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log("** starting ApiFootballData Competition job");
    return from(this.apiClient.getCompetition(this.competitionId))
      .pipe(
        flatMap((competitionRes: any) => {
          const competition = competitionRes.data;
          return this.seasonRepo.findByExternalIdAndUpdate$(competition);
        }),
        map(_ => {
          const fixturesJob = FixturesJob.Builder.setApiClient(this.apiClient)
            .setFixtureRepo(this.fixtureRepo)
            .withCompetition(this.competitionId)
            .build();

          const teamsJob = TeamsJob.Builder.setApiClient(this.apiClient)
            .setTeamRepo(this.teamRepo)
            .withCompetition(this.competitionId)
            .build();

          queue.addJob(fixturesJob);
          queue.addJob(teamsJob);
        })
      )
      .toPromise();
  }
}
