import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { TeamRepository } from '../../db/repositories/team.repo';
import { TeamsJob } from './teams.job';

export default class Builder {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _teamRepo?: TeamRepository;

  public build() {
    return new TeamsJob(this);
  }

  get apiClient() {
    return this._apiClient;
  }

  public withApiClient(value?: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  get teamRepo() {
    return this._teamRepo;
  }

  public withTeamRepo(value?: TeamRepository): Builder {
    this._teamRepo = value;
    return this;
  }

  public setCompetition(competitionId?: string | number): Builder {
    this._competitionId = competitionId;
    return this;
  }

  get competitionId() {
    return this._competitionId;
  }
}
