import { lastValueFrom } from "rxjs";
import { get } from 'lodash';

import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import { makeMatchUpdate, matchChanged } from "./util";

export interface CurrentRoundMatchesService {
  updateMatches(): Promise<void>;
}

export class CurrentRoundMatchesServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA)
  ) {
    return new CurrentRoundMatchesServiceImpl(competitionRepo, seasonRepo, matchRepo, footballApiClient);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository,
    private footballApiClient: FootballApiClient,
  ) { }

  async updateMatches(): Promise<void> {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
      const currentSeasons = await lastValueFrom(this.seasonRepo.findAllByIds$(currentSeasonIds));
      const result = await lastValueFrom(this.matchRepo.findAllFinishedByCurrentRound$(currentSeasons));
      for await (const [_seasonId, dbMatches] of result) {
        const externalIds: string[] = dbMatches.map(dbMatch => {
          const externalId = get(dbMatch, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
          return externalId;
        }).filter(Boolean);
        const apiMatchesResponse = await this.footballApiClient.getMatches(externalIds);
        const apiMatches: any[] = apiMatchesResponse.data.matches;
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
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
