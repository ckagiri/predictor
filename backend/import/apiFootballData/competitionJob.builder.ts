import { IFootballApiClient } from "../../thirdParty/footballApi/apiClient";
import { ISeasonRepository } from "../../db/repositories/season.repo";
import { ITeamRepository } from "../../db/repositories/team.repo";
import { IFixtureRepository } from "../../db/repositories/fixture.repo";
import { CompetitionJob } from "../apiFootballData/competition.job";

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: IFootballApiClient;
  private seasonRepo!: ISeasonRepository;
  private teamRepo!: ITeamRepository;
  private fixtureRepo!: IFixtureRepository;

  build() {
    return new CompetitionJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  setApiClient(value: IFootballApiClient) {
    this.apiClient = value;
    return this;
  }

  get SeasonRepo() {
    return this.seasonRepo;
  }

  setSeasonRepo(value: ISeasonRepository): Builder {
    this.seasonRepo = value;
    return this;
  }

  get TeamRepo() {
    return this.teamRepo;
  }

  setTeamRepo(value: ITeamRepository): Builder {
    this.teamRepo = value;
    return this;
  }

  get FixtureRepo() {
    return this.fixtureRepo;
  }

  setFixtureRepo(value: IFixtureRepository): Builder {
    this.fixtureRepo = value;
    return this;
  }

  withCompetition(competitionId: string | number): Builder {
    this.competitionId = competitionId;
    return this;
  }

  get CompetitionId() {
    return this.competitionId;
  }
}
