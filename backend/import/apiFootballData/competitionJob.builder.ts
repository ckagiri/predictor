import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { SeasonRepository } from '../../db/repositories/season.repo';
import { TeamRepository } from '../../db/repositories/team.repo';
import { MatchRepository } from '../../db/repositories/match.repo';
import { CompetitionJob } from '../apiFootballData/competition.job';

export default class Builder {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _seasonRepo?: SeasonRepository;
  private _teamRepo?: TeamRepository;
  private _matchRepo?: MatchRepository;

  public build() {
    return new CompetitionJob(this);
  }

  get apiClient() {
    return this._apiClient;
  }

  public withApiClient(value: FootballApiClient) {
    this._apiClient = value;
    return this;
  }

  get seasonRepo() {
    return this._seasonRepo;
  }

  public withSeasonRepo(value: SeasonRepository): Builder {
    this._seasonRepo = value;
    return this;
  }

  get teamRepo() {
    return this._teamRepo;
  }

  public withTeamRepo(value: TeamRepository): Builder {
    this._teamRepo = value;
    return this;
  }

  get matchRepo() {
    return this._matchRepo;
  }

  public withMatchRepo(value: MatchRepository): Builder {
    this._matchRepo = value;
    return this;
  }

  public setCompetition(competitionId: string | number): Builder {
    this._competitionId = competitionId;
    return this;
  }

  get competitionId() {
    return this._competitionId;
  }
}
