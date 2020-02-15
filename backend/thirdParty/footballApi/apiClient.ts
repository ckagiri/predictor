import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import ApiFootballDataClient from './apiFootballData/apiClient';

export interface IFootballApiClient {
  getCompetitions(year: number): any;
  getCompetition(competitionId: number | string): any;
  getTeams(competitionId: number | string): any;
  getFixtures(competitionId: number | string, options?: any): any;
  getTodaysFixtures(): any;
  getTomorrowsFixtures(): any;
  getYesterdaysFixtures(): any;
}

export class FootballApiClient {
  public static getInstance(provider: ApiProvider): IFootballApiClient {
    return ApiFootballDataClient.getInstance();
  }
}
