import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { MatchRepository } from '../../db/repositories/match.repo';
import { MatchesJob } from './matches.job';

export default class Builder {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _matchRepo?: MatchRepository;

  public build() {
    return new MatchesJob(this);
  }

  get apiClient() {
    return this._apiClient;
  }

  public withApiClient(value?: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  get matchRepo() {
    return this._matchRepo;
  }

  public withMatchRepo(value?: MatchRepository): Builder {
    this._matchRepo = value;
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
