import mongoose, { ConnectOptions } from "mongoose";
import schedule, { Job } from "node-schedule";
import { Scheduler, SchedulerOptions } from "./scheduler";
import { LeaderboardService, LeaderboardServiceImpl } from "./leaderboard.service";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class LeaderboardScheduler implements Scheduler {
  private job: Job = new schedule.Job('Leaderboard Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    leaderboardService = LeaderboardServiceImpl.getInstance()
  ) {
    return new LeaderboardScheduler(leaderboardService)
  }

  constructor(
    private leaderboardService: LeaderboardService
  ) {
    this.job.on('success', result => {
      this.jobSuccess(result);
    });
  }

  startJob(options: SchedulerOptions = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    this.setInterval(interval);
    if (runImmediately) {
      this.jobTask().then(result => {
        this.jobSuccess(result);
      });
    } else {
      return this.job.runOnDate(new Date(Date.now() + this.getInterval()));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    await this.leaderboardService.updateLeaderboardsForFinishedMatches();
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess(_: any, reschedule: boolean = false) {
    const nextUpdate = new Date(Date.now() + this.getInterval());
    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async runJob() {
    const result = await this.jobTask();
    this.jobSuccess(result, true);
  }

  private getInterval() {
    return this.interval;
  }

  private setInterval(value: number = DEFAULT_INTERVAL) {
    this.interval = value;
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
