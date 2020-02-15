import request from 'request-promise';
import { config } from '../../../config/environment/index';
import { IFootballApiClient } from '../apiClient';

const API_KEY = config.API_FOOTBALL_DATA.apiKey;
const BASE_URL = 'http://api.football-data.org/v2';

class ApiFootballDataClient implements IFootballApiClient {
  constructor(private apiKey: string, private baseUrl: string) {}

  public getCompetitions(year: number) {
    const queryParams = year ? { year } : undefined;
    const apiResource = '/competitions';

    return request(
      this._getOptions(this.apiKey, apiResource, queryParams),
    ).then(this._mergeResponse);
  }

  public getCompetition(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}`;

    return request(this._getOptions(this.apiKey, apiResource)).then(
      this._mergeResponse,
    );
  }

  public getTeams(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}/teams`;

    return request(this._getOptions(this.apiKey, apiResource)).then(
      this._mergeResponse,
    );
  }

  public getFixtures(competitionId: number | string, options?: any) {
    const apiResource = `/competitions/${competitionId}/matches`;

    return request(this._getOptions(this.apiKey, apiResource, options)).then(
      this._mergeResponse,
    );
  }

  public getTodaysFixtures() {
    throw new Error('Method not implemented.');
  }

  public getTomorrowsFixtures() {
    throw new Error('Method not implemented.');
  }

  public getYesterdaysFixtures() {
    throw new Error('Method not implemented.');
  }

  public _getOptions(apiKey: string, resource: string, queryParams?: any) {
    queryParams = queryParams || {};
    return {
      // method: 'GET',
      uri: BASE_URL + resource,
      headers: {
        'X-Auth-Token': apiKey,
        'X-Response-Control': 'minified',
      },
      resolveWithFullResponse: true,
      qs: queryParams,
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
}

const getInstance = () => new ApiFootballDataClient(API_KEY, BASE_URL);

export default {
  getInstance,
};

module.exports = {
  getInstance,
};

// Todod : update with X-RequestCounter-Reset X-Requests-Available-Minute
