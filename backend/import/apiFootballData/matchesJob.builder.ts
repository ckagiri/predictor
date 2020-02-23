import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { MatchRepository } from '../../db/repositories/match.repo';
import { MatchesJob } from './matches.job';

export default class Builder {
  private competitionId!: number | string;
  private apiClient!: FootballApiClient;
  private matchRepo!: MatchRepository;

  public build() {
    return new MatchesJob(this);
  }

  get ApiClient() {
    return this.apiClient;
  }

  public setApiClient(value: FootballApiClient) {
    this.apiClient = value;
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
