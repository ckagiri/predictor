import { IFootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { IFixtureRepository } from '../../db/repositories/fixture.repo';
import { FixturesJob } from './fixtures.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: IFootballApiClient;
  private fixtureRepo!: IFixtureRepository;

  public build() {
    return new FixturesJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: IFootballApiClient) {
    this.apiClient = value;
    return this;
  }

  get FixtureRepo() {
    return this.fixtureRepo;
  }

  public setFixtureRepo(value: IFixtureRepository): Builder {
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
