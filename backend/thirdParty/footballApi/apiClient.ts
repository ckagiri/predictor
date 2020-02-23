import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import ApiFootballDataClient from './apiFootballData/apiClient';

export interface FootballApiClient {
  getCompetitions(year: number): any;
  getCompetition(competitionId: number | string): any;
  getTeams(competitionId: number | string): any;
  getFixtures(competitionId: number | string, options?: any): any;
  getTodaysFixtures(): any;
  getTomorrowsFixtures(): any;
  getYesterdaysFixtures(): any;
}

export class FootballApiClientImpl {
  public static getInstance(provider: ApiProvider): FootballApiClient {
    switch (provider) {
      case ApiProvider.LIGI:
        return ApiFootballDataClient.getInstance();
      default:
        throw new Error('FootballApiClient for Provider does not exist');
    }
  }
}
