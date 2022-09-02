import { lastValueFrom } from "rxjs";
import { get } from 'lodash';

import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import { makeMatchUpdate, matchChanged } from "./util";

export interface TodayAndMorrowService {
  updateMatches(includeYesterdayAndTomorrowMatches: boolean): Promise<any[]>
}

export class TodayAndMorrowServiceImpl implements TodayAndMorrowService {
  public static getInstance(
    matchRepo = MatchRepositoryImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA)
  ) {
    return new TodayAndMorrowServiceImpl(matchRepo, footballApiClient);
  }

  constructor(
    private matchRepo: MatchRepository,
    private footballApiClient: FootballApiClient,
  ) { }

  async updateMatches(includeTomorrowsMatches: boolean): Promise<any[]> {
    let apiMatches: any[] = [];
    if (includeTomorrowsMatches) {
      const tommorowApiMatchesResponse = await this.footballApiClient.getTomorrowsMatches();
      apiMatches = tommorowApiMatchesResponse.data.matches as any[]
    }
    const todayApiMatchesResponse = await this.footballApiClient.getTodaysMatches();
    apiMatches = apiMatches.concat(todayApiMatchesResponse.data.matches as any[]);

    const externalIds: string[] = apiMatches.map(m => m.id)
    const dbMatches = await lastValueFrom(this.matchRepo.findByExternalIds$(externalIds));
    for await (const apiMatch of apiMatches) {
      const dbMatch = dbMatches.find(match => {
        const externalId = get(match, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
        return apiMatch.id === externalId;
      });
      if (!dbMatch) continue;
      if (matchChanged(apiMatch, dbMatch)) {
        const matchId = dbMatch?.id!;
        const update = makeMatchUpdate(apiMatch);
        await lastValueFrom(this.matchRepo.findByIdAndUpdate$(matchId, update));
      }
    }

    return apiMatches;
  }
}
