import { lastValueFrom } from "rxjs";
import { get } from 'lodash';

import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import { GameRoundRepository, GameRoundRepositoryImpl } from "../../../db/repositories/gameRound.repo";

export interface SeasonNextRoundService {
  updateSeasons(): Promise<any[]>
}

export class SeasonNextRoundServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA)
  ) {
    return new SeasonNextRoundServiceImpl(competitionRepo, seasonRepo, gameRoundRepo, footballApiClient);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private footballApiClient: FootballApiClient,
  ) { }

  async updateSeasons(): Promise<any[]> {
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const updatedSeasons: any[] = [];
    for await (const competition of competitions) {
      const currentSeasonId = competition.currentSeason?.toString();
      if (!currentSeasonId) continue;

      const currentSeason = await lastValueFrom(this.seasonRepo.findById$(currentSeasonId));
      const currentRoundId = currentSeason.currentGameRound?.toString();
      if (!currentRoundId) continue;

      const currentRound = await lastValueFrom(this.gameRoundRepo.findById$(currentRoundId));
      const dbCurrentRoundPosition = currentRound.position;

      const externalId = get(competition, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
      if (!externalId) continue;

      const apiCompetitionResponse = await this.footballApiClient.getCompetition(externalId)
      const { data: apiCompetition } = apiCompetitionResponse;
      const apiCurrentMatchday = get(apiCompetition, ['currentSeason', 'currentMatchday']);

      if (apiCurrentMatchday !== dbCurrentRoundPosition) {
        const nextGameRound = await lastValueFrom(this.gameRoundRepo.findOne$({ position: apiCurrentMatchday }));
        if (!nextGameRound) continue;

        updatedSeasons.push(currentSeasonId);
        await lastValueFrom(this.seasonRepo.findByIdAndUpdate$(currentSeasonId, { currentGameRound: nextGameRound.id }));
      }
    }
    return updatedSeasons;
  }
}
