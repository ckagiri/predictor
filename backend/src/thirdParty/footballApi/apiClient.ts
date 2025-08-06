import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import ApiFootballDataClient from './apiFootballData/apiClient.js';

export interface FootballApiClient {
  getCompetition(competitionId: number | string): Promise<any>;
  getCompetitionMatches(competitionId: number | string): Promise<any>;
  getCompetitions(year: number): Promise<any>;
  getLiveMatches(competitions?: string[] | number[]): Promise<any>;
  getMatches(matchIds: number[] | string[]): Promise<any>;
  getTeams(competitionId: number | string): Promise<any>;
  getTodaysAndMorrowsMatches(competitions?: string[] | number[]): Promise<any>;
  getTodaysMatches(competitions?: string[] | number[]): Promise<any>;
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
