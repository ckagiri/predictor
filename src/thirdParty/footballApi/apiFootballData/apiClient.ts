import request from "request-promise";
import { config } from "../../../config/environment/index";
import { IFootballApiClient } from "../apiClient";

const API_KEY = config.API_FOOTBALL_DATA.apiKey;
const BASE_URL = "http://api.football-data.org/v2";

class ApiFootballDataClient implements IFootballApiClient {
  constructor(private apiKey: string, private baseUrl: string) {}

  getCompetitions(year: number) {
    const queryParams = year ? { year } : undefined;
    const apiResource = "/competitions";

    return request(
      this._getOptions(this.apiKey, apiResource, queryParams)
    ).then(this._mergeResponse);
  }

  getCompetition(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}`;

    return request(this._getOptions(this.apiKey, apiResource)).then(
      this._mergeResponse
    );
  }

  getTeams(competitionId: number | string) {
    const apiResource = `/competitions/${competitionId}/teams`;

    return request(this._getOptions(this.apiKey, apiResource)).then(
      this._mergeResponse
    );
  }

  getFixtures(competitionId: number | string, options?: any) {
    const apiResource = `/competitions/${competitionId}/matches`;

    return request(this._getOptions(this.apiKey, apiResource, options)).then(
      this._mergeResponse
    );
  }

  getTodaysFixtures() {
    throw new Error("Method not implemented.");
  }

  getTomorrowsFixtures() {
    throw new Error("Method not implemented.");
  }

  getYesterdaysFixtures() {
    throw new Error("Method not implemented.");
  }

  _getOptions(apiKey: string, resource: string, queryParams?: any) {
    queryParams = queryParams || {};
    return {
      // method: 'GET',
      uri: BASE_URL + resource,
      headers: {
        "X-Auth-Token": apiKey,
        "X-Response-Control": "minified"
      },
      resolveWithFullResponse: true,
      qs: queryParams
    };
  }

  _mergeResponse(response: any) {
    return {
      data: JSON.parse(response.body),
      metadata: {
        requestCount: response.headers["x-requests-available"],
        requestCountReset: response.headers["x-requestcounter-reset"]
      }
    };
  }
}

const getInstance = () => new ApiFootballDataClient(API_KEY, BASE_URL);

export default {
  getInstance
};

module.exports = {
  getInstance
};

// Todod : update with X-RequestCounter-Reset X-Requests-Available-Minute
