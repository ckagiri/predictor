import { lastValueFrom } from "rxjs";
import { get, isEmpty } from 'lodash';

import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import { makeMatchUpdate, matchChanged } from "./util";

export const enum PERIOD {
  LIVE = 'LIVE',
  TODAY = 'TODAY',
  TODAY_AND_MORROW = 'TODAY_AND_MORROW'
}

export interface TodayAndMorrowService {
  syncMatches(period: PERIOD): Promise<any[]>
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

  async syncMatches(period: PERIOD): Promise<any[]> {
    let apiMatches: any[] = [];
    try {
      if (period === PERIOD.LIVE) {
        console.log('fetching live matches...')
        const liveApiMatchesResponse = await this.footballApiClient.getLiveMatches();
        apiMatches = liveApiMatchesResponse.data.matches as any[];
      } else if (period === PERIOD.TODAY) {
        console.log("fetching today's matches...")
        const todayApiMatchesResponse = await this.footballApiClient.getTodaysMatches();
        apiMatches = todayApiMatchesResponse.data.matches as any[];
      } else if (period === PERIOD.TODAY_AND_MORROW) {
        console.log("fetching today's and tomorrow's matches...")
        const todaysAndMorrowsApiMatchesResponse = await this.footballApiClient.getTodaysAndMorrowsMatches();
        apiMatches = todaysAndMorrowsApiMatchesResponse.data.matches as any[]
      }
      if (isEmpty(apiMatches)) {
        return []
      }

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
    } catch (err: any) {
      console.log(err.message);
    }
    return apiMatches;
  }
}
