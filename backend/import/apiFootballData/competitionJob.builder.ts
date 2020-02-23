import { IFootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { SeasonRepository } from '../../db/repositories/season.repo';
import { TeamRepository } from '../../db/repositories/team.repo';
import { FixtureRepository } from '../../db/repositories/fixture.repo';
import { CompetitionJob } from '../apiFootballData/competition.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: IFootballApiClient;
  private seasonRepo!: SeasonRepository;
  private teamRepo!: TeamRepository;
  private fixtureRepo!: FixtureRepository;

  public build() {
    return new CompetitionJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: IFootballApiClient) {
    this.apiClient = value;
    return this;
  }

  get SeasonRepo() {
    return this.seasonRepo;
  }

  public setSeasonRepo(value: SeasonRepository): Builder {
    this.seasonRepo = value;
    return this;
  }

  get TeamRepo() {
    return this.teamRepo;
  }

  public setTeamRepo(value: TeamRepository): Builder {
    this.teamRepo = value;
    return this;
  }

  get FixtureRepo() {
    return this.fixtureRepo;
  }

  public setFixtureRepo(value: FixtureRepository): Builder {
    this.fixtureRepo = value;
    return this;
  }

  public withCompetition(competitionId: string | number): Builder {
    this.competitionId = competitionId;
    return this;
  }

  get CompetitionId() {
    return this.competitionId;
  }
}
