import { MatchRepository } from '../../../../db/repositories/match.repo.js';
import { FootballApiClient } from '../../../../thirdParty/footballApi/apiClient.js';
import { MatchesJob } from './matches.job.js';

export default class Builder {
  get apiClient() {
    return this._apiClient;
  }
  get competitionId() {
    return this._competitionId;
  }
  get matchRepo() {
    return this._matchRepo;
  }

  private _apiClient?: FootballApiClient;

  private _competitionId?: number | string;

  private _matchRepo?: MatchRepository;

  public build() {
    return new MatchesJob(this);
  }

  public setCompetition(competitionId?: number | string): this {
    this._competitionId = competitionId;
    return this;
  }

  public withApiClient(value?: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  public withMatchRepo(value?: MatchRepository): this {
    this._matchRepo = value;
    return this;
  }
}
