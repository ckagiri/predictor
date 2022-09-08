import schedule from 'node-schedule';

import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './footballApi/matches.currentRound.service';
import { TodayAndMorrowScheduler } from "./footballApi/matches.todayAndMorrow.scheduler";
import { SeasonNextRoundScheduler } from "./footballApi/season.nextRound.scheduler";
import { PredictionPointsScheduler } from './predictionPoints.scheduler';
import { MakePredictionsScheduler } from "./makePredictions.scheduler";

export class AppSchedule {
  private readonly currentRoundMatchesService: CurrentRoundMatchesService;
  private readonly todayAndMorrowScheduler: TodayAndMorrowScheduler;
  private readonly seasonNextRoundScheduler: SeasonNextRoundScheduler;
  private readonly predictionPointsScheduler: PredictionPointsScheduler;
  private readonly makePredictionsScheduler: MakePredictionsScheduler;

  static getInstance() {
    return new AppSchedule();
  }

  constructor() {
    this.currentRoundMatchesService = CurrentRoundMatchesServiceImpl.getInstance();
    this.todayAndMorrowScheduler = TodayAndMorrowScheduler.getInstance();
    this.seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
    this.predictionPointsScheduler = PredictionPointsScheduler.getInstance();
    this.makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  }

  async start() {
    await this.currentRoundMatchesService.updateMatches();
    await this.predictionPointsScheduler.startJob({ runImmediately: true, interval: '0 15 * * * *' }); // minute 15 every H
    await this.seasonNextRoundScheduler.startJob({ interval: '0 0 */4 * * *' }); // minute 0 every 4H
    await this.makePredictionsScheduler.startJob(); // loop after 3H
    await this.todayAndMorrowScheduler.startJob(); // loop after min/max ~90s/12H
  }

  publish(message: string) {
  }

  async shutdown() {
    await schedule.gracefulShutdown();
  }
}

