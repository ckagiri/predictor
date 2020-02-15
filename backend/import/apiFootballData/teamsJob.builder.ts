import { IFootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { ITeamRepository } from '../../db/repositories/team.repo';
import { TeamsJob } from './teams.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: IFootballApiClient;
  private teamRepo!: ITeamRepository;

  public build() {
    return new TeamsJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: IFootballApiClient) {
    this.apiClient = value;
    return this;
  }

  get TeamRepo() {
    return this.teamRepo;
  }

  public setTeamRepo(value: ITeamRepository): Builder {
    this.teamRepo = value;
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
