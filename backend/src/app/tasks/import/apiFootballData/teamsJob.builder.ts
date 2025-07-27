import { TeamRepository } from '../../../../db/repositories/team.repo.js';
import { FootballApiClient } from '../../../../thirdParty/footballApi/apiClient.js';
import { TeamsJob } from './teams.job.js';

export default class Builder {
  get apiClient() {
    return this._apiClient;
  }
  get competitionId() {
    return this._competitionId;
  }
  get teamRepo() {
    return this._teamRepo;
  }

  private _apiClient?: FootballApiClient;

  private _competitionId?: number | string;

  private _teamRepo?: TeamRepository;

  public build() {
    return new TeamsJob(this);
  }

  public setCompetition(competitionId?: number | string): this {
    this._competitionId = competitionId;
    return this;
  }

  public withApiClient(value?: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  public withTeamRepo(value?: TeamRepository): this {
    this._teamRepo = value;
    return this;
  }
}
