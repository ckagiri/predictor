import { MatchRepository } from '../../db/repositories/match.repo.js';
import { SeasonRepository } from '../../db/repositories/season.repo.js';
import { TeamRepository } from '../../db/repositories/team.repo.js';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient.js';
import { CompetitionJob } from '../apiFootballData/competition.job.js';

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
  get seasonRepo() {
    return this._seasonRepo;
  }
  get teamRepo() {
    return this._teamRepo;
  }

  private _apiClient?: FootballApiClient;

  private _competitionId?: number | string;

  private _matchRepo?: MatchRepository;

  private _seasonRepo?: SeasonRepository;

  private _teamRepo?: TeamRepository;

  public build() {
    return new CompetitionJob(this);
  }

  public setCompetition(competitionId: number | string): this {
    this._competitionId = competitionId;
    return this;
  }

  public withApiClient(value: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  public withMatchRepo(value: MatchRepository): this {
    this._matchRepo = value;
    return this;
  }

  public withSeasonRepo(value: SeasonRepository): this {
    this._seasonRepo = value;
    return this;
  }

  public withTeamRepo(value: TeamRepository): this {
    this._teamRepo = value;
    return this;
  }
}
