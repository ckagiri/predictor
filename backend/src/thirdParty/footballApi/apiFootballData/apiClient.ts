import axios from 'axios';

import DateUtil from '../../../common/dateUtil.js';
import { FootballApiClient } from '../apiClient.js';

const BASE_URL = 'http://api.football-data.org/v4';

class ApiFootballDataClient implements FootballApiClient {
  constructor(private apiKey: string) {}

  private options(queryParams?: any) {
    return {
      headers: {
        'X-Auth-Token': this.apiKey,
        'X-Response-Control': 'minified',
      },
      params: queryParams,
    };
  }

  private mergeResponse(response: any) {
    return {
      data: {
        ...response.data,
        count: response.data.count ?? response.data.resultSet?.count,
      },
      metadata: {
        requestCount: response.headers['x-requests-available'],
        requestCountReset: response.headers['x-requestcounter-reset'],
      },
    };
  }

  async getCompetitions(year?: number): Promise<any> {
    year = year ?? new Date().getFullYear();
    const url = `${BASE_URL}/competitions`;
    const response = await axios.get(url, this.options({ year }));
    return this.mergeResponse(response);
  }

  async getCompetition(competitionId: number | string = 'PL'): Promise<any> {
    const url = `${BASE_URL}/competitions/${String(competitionId)}`;
    const response = await axios.get(url, this.options());
    return this.mergeResponse(response);
  }

  async getCompetitionMatches(competitionId: number | string): Promise<any> {
    const url = `${BASE_URL}/competitions/${String(competitionId)}/matches`;
    const response = await axios.get(url, this.options());
    return this.mergeResponse(response);
  }

  async getLiveMatches(
    competitions: string[] | number[] = ['PL']
  ): Promise<any> {
    const url = `${BASE_URL}/competitions/${competitions.join(',')}/matches`;
    const response = await axios.get(
      url,
      this.options({
        competitions: competitions,
        status: 'LIVE',
      })
    );
    return this.mergeResponse(response);
  }

  async getMatches(matchIds: number[] | string[]): Promise<any> {
    const url = `${BASE_URL}/matches`;
    const response = await axios.get(
      url,
      this.options({ ids: matchIds.join(',') })
    );
    return this.mergeResponse(response);
  }

  async getTeams(competitionId: number | string = 'PL'): Promise<any> {
    const url = `${BASE_URL}/competitions/${String(competitionId)}/teams`;
    const response = await axios.get(url, this.options());
    return this.mergeResponse(response);
  }

  async getTodaysAndMorrowsMatches(
    competitions: string[] | number[] = ['PL']
  ): Promise<any> {
    const url = `${BASE_URL}/matches`;
    const today = DateUtil.getFormattedDate(new Date());
    const future = DateUtil.getFormattedDate(DateUtil.addDays(new Date(), 2));
    const response = await axios.get(
      url,
      this.options({
        competitions: competitions.join(','),
        dateFrom: today,
        dateTo: future,
      })
    );
    return this.mergeResponse(response);
  }

  async getTodaysMatches(
    competitions: string[] | number[] = ['PL']
  ): Promise<any> {
    const url = `${BASE_URL}/matches`;
    const response = await axios.get(
      url,
      this.options({
        competitions: competitions.join(','),
        date: 'TODAY',
      })
    );
    return this.mergeResponse(response);
  }
}

export default {
  getInstance: () => {
    return new ApiFootballDataClient(process.env.API_FOOTBALL_DATA_KEY!);
  },
};
