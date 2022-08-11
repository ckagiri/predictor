import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import ApiFootballDataClient from './apiFootballData/apiClient';

export interface FootballApiClient {
  getCompetitions(year?: number): Promise<any>;
  getCompetition(competitionId?: number | string): Promise<any>;
  getTeams(competitionId?: number | string): Promise<any>;
  getCompetitionMatches(competitionId?: number | string, options?: any): Promise<any>;
  getMatches(matchIds?: string[]): Promise<any>;
  getTodaysMatches(): Promise<any>;
  getTomorrowsMatches(): Promise<any>;
  getYesterdaysMatches(): Promise<any>;
}

export class FootballApiClientImpl {
  public static getInstance(provider: ApiProvider): FootballApiClient {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
        return ApiFootballDataClient.getInstance();
      default:
        throw new Error('FootballApiClient for Provider does not exist');
    }
  }
}
