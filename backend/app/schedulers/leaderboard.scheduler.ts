import mongoose, { ConnectOptions } from "mongoose";
import { LeaderboardService, LeaderboardServiceImpl } from "./leaderboard.service";
import { BaseScheduler } from "./baseScheduler";

export class LeaderboardScheduler extends BaseScheduler {
  public static getInstance(
    leaderboardService = LeaderboardServiceImpl.getInstance()
  ) {
    return new LeaderboardScheduler(leaderboardService)
  }

  constructor(
    private leaderboardService: LeaderboardService
  ) {
    super('Leaderboard Job');
  }

  async task() {
    await this.leaderboardService.updateLeaderboardsForFinishedMatches();
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = LeaderboardScheduler.getInstance();
  scheduler.startJob({
    interval: 5 * 1000, runImmediately: true
  });
})();
