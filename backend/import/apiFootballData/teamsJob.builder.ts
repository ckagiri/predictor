import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { TeamRepository } from '../../db/repositories/team.repo';
import { TeamsJob } from './teams.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: FootballApiClient;
  private teamRepo!: TeamRepository;

  public build() {
    return new TeamsJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: FootballApiClient) {
    this.apiClient = value;
    return this;
  }

  get TeamRepo() {
    return this.teamRepo;
  }

  public setTeamRepo(value: TeamRepository): Builder {
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
