import moment from 'moment';
import request from 'request-promise';

import { FootballApiClient } from '../apiClient.js';

const BASE_URL = 'http://api.football-data.org/v4';

class ApiFootballDataClient implements FootballApiClient {
  constructor(private apiKey: string) {}

  public _getOptions(apiKey: string, resource: string, queryParams?: any) {
    queryParams = queryParams ?? {};
    return {
      headers: {
        'X-Auth-Token': apiKey,
        'X-Response-Control': 'minified',
      },
      qs: queryParams,
      resolveWithFullResponse: true,
      // method: 'GET',
      uri: BASE_URL + resource,
    };
  }

  public _mergeResponse(response: any) {
    return {
      data: JSON.parse(response.body),
      metadata: {
        requestCount: response.headers['x-requests-available'],
        requestCountReset: response.headers['x-requestcounter-reset'],
      },
    };
  }

  public getCompetition(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}`;

    return request(this._getOptions(this.apiKey, apiResource)).then(response =>
      this._mergeResponse(response)
    );
  }

  getCompetitionMatches(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}/matches`;

    return request(this._getOptions(this.apiKey, apiResource)).then(response =>
      this._mergeResponse(response)
    );
  }

  public getCompetitions(year: number) {
    const queryParams = year ? { year } : undefined;
    const apiResource = '/competitions';

    return request(
      this._getOptions(this.apiKey, apiResource, queryParams)
    ).then(response => this._mergeResponse(response));
  }

  getLiveMatches(): Promise<any> {
    const apiResource = `/matches`;
    return request(
      this._getOptions(this.apiKey, apiResource, {
        competitions: 'PL',
        status: 'LIVE',
      })
    ).then(response => this._mergeResponse(response));
  }

  getMatches(matchIds?: string[]) {
    const apiResource = `/matches`;

    return request(
      this._getOptions(this.apiKey, apiResource, { ids: matchIds?.join(',') })
    ).then(response => this._mergeResponse(response));
  }

  public getTeams(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}/teams`;

    return request(this._getOptions(this.apiKey, apiResource)).then(response =>
      this._mergeResponse(response)
    );
  }

  getTodaysAndMorrowsMatches(): Promise<any> {
    const apiResource = `/matches`;
    const dateFrom = moment().format('YYYY-MM-DD');
    const dateTo = moment().add(2, 'days').format('YYYY-MM-DD');
    return request(
      this._getOptions(this.apiKey, apiResource, {
        competitions: 'PL',
        dateFrom,
        dateTo,
      })
    ).then(response => this._mergeResponse(response));
  }

  getTodaysMatches(): Promise<any> {
    const apiResource = `/matches`;
    return request(
      this._getOptions(this.apiKey, apiResource, {
        competitions: 'PL',
        date: 'TODAY',
      })
    ).then(response => this._mergeResponse(response));
  }
}

export const getInstance = () =>
  new ApiFootballDataClient(process.env.API_FOOTBALL_DATA_KEY!);

export default {
  getInstance,
};
