import schedule from 'node-schedule';

import { CalculatePredictionsScheduler } from "./calculatePredictions.scheduler";
import { CurrentRoundMatchesScheduler } from "./footballApi/matches.currentRound.scheduler"
import { TodayAndMorrowScheduler } from "./footballApi/matches.todayAndMorrow.scheduler";
import { SeasonNextRoundScheduler } from "./footballApi/season.nextRound.scheduler";
import { LeaderboardScheduler } from "./leaderboard.scheduler";
import { MakePredictionsScheduler } from "./makePredictions.scheduler";

export class AppSchedule {
  private readonly currentRoundMatchesScheduler: CurrentRoundMatchesScheduler;
  private readonly todayAndMorrowScheduler: TodayAndMorrowScheduler;
  private readonly seasonNextRoundScheduler: SeasonNextRoundScheduler;
  private readonly calculatePredictionsScheduler: CalculatePredictionsScheduler;
  private readonly leaderboardScheduler: LeaderboardScheduler;
  private readonly makePredictionsScheduler: MakePredictionsScheduler;

  static getInstance() {
    return new AppSchedule();
  }

  constructor() {
    this.currentRoundMatchesScheduler = CurrentRoundMatchesScheduler.getInstance();
    this.todayAndMorrowScheduler = TodayAndMorrowScheduler.getInstance();
    this.seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
    this.calculatePredictionsScheduler = CalculatePredictionsScheduler.getInstance();
    this.leaderboardScheduler = LeaderboardScheduler.getInstance();
    this.makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  }

  async start() {
    await this.currentRoundMatchesScheduler.startJob({ runImmediately: true });
    await this.todayAndMorrowScheduler.startJob();
    await this.makePredictionsScheduler.startJob({ runImmediately: true });
    await this.calculatePredictionsScheduler.startJob({ runImmediately: true });
    await this.leaderboardScheduler.startJob({ runImmediately: true });
    await this.seasonNextRoundScheduler.startJob();
  }

  publish(message: string) {
  }

  async shutdown() {
    await schedule.gracefulShutdown();
  }
}

