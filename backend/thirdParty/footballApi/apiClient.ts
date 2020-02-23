import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import ApiFootballDataClient from './apiFootballData/apiClient';

export interface FootballApiClient {
  getCompetitions(year: number): any;
  getCompetition(competitionId: number | string): any;
  getTeams(competitionId: number | string): any;
  getMatches(competitionId: number | string, options?: any): any;
  getTodaysMatches(): any;
  getTomorrowsMatches(): any;
  getYesterdaysMatches(): any;
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
