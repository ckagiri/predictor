import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import ApiFootballDataClient from './apiFootballData/apiClient.js';

export interface FootballApiClient {
  getCompetition(competitionId?: number | string): Promise<any>;
  getCompetitionMatches(
    competitionId?: number | string,
    options?: any
  ): Promise<any>;
  getCompetitions(year?: number): Promise<any>;
  getLiveMatches(): Promise<any>;
  getMatches(matchIds?: string[]): Promise<any>;
  getTeams(competitionId?: number | string): Promise<any>;
  getTodaysAndMorrowsMatches(): Promise<any>;
  getTodaysMatches(): Promise<any>;
}

export const FootballApiClientImpl = {
  getInstance(provider: ApiProvider): FootballApiClient {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
        return ApiFootballDataClient.getInstance();
      default:
        throw new Error('FootballApiClient for Provider does not exist');
    }
  },
};
