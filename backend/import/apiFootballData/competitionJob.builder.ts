import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { SeasonRepository } from '../../db/repositories/season.repo';
import { TeamRepository } from '../../db/repositories/team.repo';
import { MatchRepository } from '../../db/repositories/match.repo';
import { CompetitionJob } from '../apiFootballData/competition.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: FootballApiClient;
  private seasonRepo!: SeasonRepository;
  private teamRepo!: TeamRepository;
  private matchRepo!: MatchRepository;

  public build() {
    return new CompetitionJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: FootballApiClient) {
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

  get MatchRepo() {
    return this.matchRepo;
  }

  public setMatchRepo(value: MatchRepository): Builder {
    this.matchRepo = value;
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
