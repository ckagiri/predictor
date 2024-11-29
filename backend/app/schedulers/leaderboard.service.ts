import { lastValueFrom } from "rxjs";
import { isEmpty } from "lodash";

import { CompetitionRepository, CompetitionRepositoryImpl } from "../../db/repositories/competition.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../db/repositories/match.repo";
import { LeaderboardProcessor, LeaderboardProcessorImpl } from "./leaderboard.processor";

export interface LeaderboardService {
  updateGlobalLeaderboards(): Promise<void>;
}

export class LeaderboardServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    leaderboardProcessor = LeaderboardProcessorImpl.getInstance()
  ) {
    return new LeaderboardServiceImpl(competitionRepo, matchRepo, leaderboardProcessor)
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private matchRepo: MatchRepository,
    private leaderboardProcessor: LeaderboardProcessor) {
  }

  async updateGlobalLeaderboards() {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
      const result = await lastValueFrom(
        this.matchRepo.findAllFinishedBySeason$(currentSeasonIds, {
          allPredictionPointsCalculated: true
        })
      );
      for await (const [seasonId, matches] of result) {
        if (isEmpty(matches)) continue;
        await this.leaderboardProcessor.updateScores(seasonId, matches)
        await this.leaderboardProcessor.updateRankings(seasonId, matches)
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
