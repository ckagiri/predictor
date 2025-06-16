import schedule from 'node-schedule';

import {
  CurrentRoundMatchesService,
  CurrentRoundMatchesServiceImpl,
} from './footballApi/matches.currentRound.service.js';
import { TodayAndMorrowScheduler } from './footballApi/matches.todayAndMorrow.scheduler.js';
import { SeasonNextRoundScheduler } from './footballApi/season.nextRound.scheduler.js';
import { LeaderboardScheduler } from './leaderboard.scheduler.js';
import { MakePredictionsScheduler } from './makePredictions.scheduler.js';
import { PredictionPointsScheduler } from './predictionPoints.scheduler.js';

export class AppSchedule {
  private readonly currentRoundMatchesService: CurrentRoundMatchesService;
  private readonly leaderboardScheduler: LeaderboardScheduler;
  private readonly makePredictionsScheduler: MakePredictionsScheduler;
  private readonly predictionPointsScheduler: PredictionPointsScheduler;
  private readonly seasonNextRoundScheduler: SeasonNextRoundScheduler;
  private readonly todayAndMorrowScheduler: TodayAndMorrowScheduler;

  constructor() {
    this.currentRoundMatchesService =
      CurrentRoundMatchesServiceImpl.getInstance();
    this.todayAndMorrowScheduler = TodayAndMorrowScheduler.getInstance();
    this.seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
    this.predictionPointsScheduler = PredictionPointsScheduler.getInstance();
    this.leaderboardScheduler = LeaderboardScheduler.getInstance();
    this.makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  }

  static getInstance() {
    return new AppSchedule();
  }

  publish(message: string) {
    console.log(`Publish: ${message}`);
  }

  async shutdown() {
    await schedule.gracefulShutdown();
  }

  async start() {
    await this.currentRoundMatchesService.updateMatches();
    await this.todayAndMorrowScheduler.startJob({ runImmediately: true }); // loop after min/max 90s/6H
    await this.predictionPointsScheduler.startJob({
      interval: '0 15 * * * *',
      runImmediately: true,
    }); // minute 15 every H
    await this.leaderboardScheduler.startJob({ runImmediately: true }); // loop after 6H
    await this.seasonNextRoundScheduler.startJob({ interval: '0 0 */2 * * *' }); // minute 0 every 2H
    await this.makePredictionsScheduler.startJob(); // loop after 3H
  }
}
