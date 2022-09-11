import moment from 'moment';
import request from 'request-promise';
import { FootballApiClient } from '../apiClient';

const BASE_URL = 'http://api.football-data.org/v4';

class ApiFootballDataClient implements FootballApiClient {
  constructor(private apiKey: string) { }

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

  getCompetitionMatches(competitionId: string | number) {
    const apiResource = `/competitions/${competitionId}/matches`;

    return request(this._getOptions(this.apiKey, apiResource)).then(
      this._mergeResponse,
    );
  }

  getMatches(matchIds?: string[] | undefined) {
    const apiResource = `/matches`;

    return request(this._getOptions(this.apiKey, apiResource, { ids: matchIds?.join(',') })).then(
      this._mergeResponse,
    );
  }

  getLiveMatches(): Promise<any> {
    const apiResource = `/matches`;
    return request(this._getOptions(this.apiKey, apiResource, { competitions: 'PL', status: 'LIVE' })).then(
      this._mergeResponse,
    );
  }

  getTodaysMatches(): Promise<any> {
    const apiResource = `/matches`;
    return request(this._getOptions(this.apiKey, apiResource, { competitions: 'PL', date: 'TODAY' })).then(
      this._mergeResponse,
    );
  }

  getTodaysAndMorrowsMatches(): Promise<any> {
    const apiResource = `/matches`;
    const dateFrom = moment().format('YYYY-MM-DD');
    const dateTo = moment().add(2, 'days').format('YYYY-MM-DD');
    return request(this._getOptions(this.apiKey, apiResource, { competitions: 'PL', dateFrom, dateTo })).then(
      this._mergeResponse,
    );
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

const getInstance = () =>
  new ApiFootballDataClient(process.env.API_FOOTBALL_DATA_KEY!);

export default {
  getInstance,
};

module.exports = {
  getInstance,
};
