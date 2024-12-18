import schedule from 'node-schedule';

import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './footballApi/matches.currentRound.service';
import { TodayAndMorrowScheduler } from "./footballApi/matches.todayAndMorrow.scheduler";
import { SeasonNextRoundScheduler } from "./footballApi/season.nextRound.scheduler";
import { PredictionPointsScheduler } from './predictionPoints.scheduler';
import { LeaderboardScheduler } from './leaderboard.scheduler';
import { MakePredictionsScheduler } from "./makePredictions.scheduler";

export class AppSchedule {
  private readonly currentRoundMatchesService: CurrentRoundMatchesService;
  private readonly todayAndMorrowScheduler: TodayAndMorrowScheduler;
  private readonly seasonNextRoundScheduler: SeasonNextRoundScheduler;
  private readonly predictionPointsScheduler: PredictionPointsScheduler;
  private readonly leaderboardScheduler: LeaderboardScheduler;
  private readonly makePredictionsScheduler: MakePredictionsScheduler;

  static getInstance() {
    return new AppSchedule();
  }

  constructor() {
    this.currentRoundMatchesService = CurrentRoundMatchesServiceImpl.getInstance();
    this.todayAndMorrowScheduler = TodayAndMorrowScheduler.getInstance();
    this.seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
    this.predictionPointsScheduler = PredictionPointsScheduler.getInstance();
    this.leaderboardScheduler = LeaderboardScheduler.getInstance();
    this.makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  }

  async start() {
    await this.currentRoundMatchesService.updateMatches();
    await this.todayAndMorrowScheduler.startJob({ runImmediately: true }); // loop after min/max 90s/6H
    await this.predictionPointsScheduler.startJob({ runImmediately: true, interval: '0 15 * * * *' }); // minute 15 every H
    await this.leaderboardScheduler.startJob({ runImmediately: true }); // loop after 6H
    await this.seasonNextRoundScheduler.startJob({ interval: '0 0 */2 * * *' }); // minute 0 every 2H
    await this.makePredictionsScheduler.startJob(); // loop after 3H
  }

  publish(message: string) {
  }

  async shutdown() {
    await schedule.gracefulShutdown();
  }
}

