import { get } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { FootballApiProvider } from '../../../common/footballApiProvider.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../db/repositories/competition.repo.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../../db/repositories/gameRound.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../db/repositories/season.repo.js';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../../thirdParty/footballApi/apiClient.js';

export interface SeasonNextRoundService {
  updateSeasons(): Promise<any[]>;
}

export class SeasonNextRoundServiceImpl {
  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private footballApiClient: FootballApiClient
  ) {}

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    footballApiClient = FootballApiClientImpl.getInstance(
      FootballApiProvider.API_FOOTBALL_DATA
    )
  ) {
    return new SeasonNextRoundServiceImpl(
      competitionRepo,
      seasonRepo,
      gameRoundRepo,
      footballApiClient
    );
  }

  async updateSeasons(): Promise<any[]> {
    const updatedSeasons: any[] = [];
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      for (const competition of competitions) {
        const currentSeasonId = competition.currentSeason?.toString();
        if (!currentSeasonId) continue;

        const currentSeason = await lastValueFrom(
          this.seasonRepo.findById$(currentSeasonId)
        );
        const currentRoundId = currentSeason?.currentGameRound?.toString();
        if (!currentRoundId) continue;

        const currentRound = await lastValueFrom(
          this.gameRoundRepo.findById$(currentRoundId)
        );
        const dbCurrentRoundPosition = currentRound?.position;

        const externalId = get(competition, [
          'externalReference',
          FootballApiProvider.API_FOOTBALL_DATA,
          'id',
        ]);
        if (!externalId) continue;

        const apiCompetitionResponse =
          await this.footballApiClient.getCompetition(externalId);
        const { data: apiCompetition } = apiCompetitionResponse;
        const apiCurrentMatchday = get(apiCompetition, [
          'currentSeason',
          'currentMatchday',
        ]);

        if (parseInt(apiCurrentMatchday, 10) > (dbCurrentRoundPosition ?? 0)) {
          const nextGameRound = await lastValueFrom(
            this.gameRoundRepo.findOne$({ position: apiCurrentMatchday })
          );
          if (!nextGameRound) continue;

          await lastValueFrom(
            this.seasonRepo.findByIdAndUpdate$(currentSeasonId, {
              currentGameRound: nextGameRound.id,
              currentMatchday: apiCurrentMatchday,
            })
          );
          updatedSeasons.push(currentSeasonId);
        }
      }
    } catch (err: any) {
      console.log(err.message);
    }
    return updatedSeasons;
  }
}
