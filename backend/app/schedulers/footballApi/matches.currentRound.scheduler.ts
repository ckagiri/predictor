import { Scheduler } from "../scheduler";
import schedule, { Job } from "node-schedule";
import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './matches.currentRound.service';
import mongoose, { ConnectOptions } from "mongoose";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000; // 7H

export class CurrentRoundMatchesScheduler implements Scheduler {
  private job: Job = new schedule.Job('CurrentRoundMatches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    currentRoundMatchesService = CurrentRoundMatchesServiceImpl.getInstance()
  ) {
    return new CurrentRoundMatchesScheduler(currentRoundMatchesService);
  }

  constructor(
    private currentRoundMatchesService: CurrentRoundMatchesService
  ) {
    this.job.on('success', () => {
      this.jobSuccess();
    });
  }

  startJob(options = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    this.setInterval(interval);
    if (runImmediately) {
      this.jobTask().then(() => {
        this.jobSuccess();
      });
    } else {
      return this.job.runOnDate(new Date(Date.now() + this.getInterval()));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    await this.currentRoundMatchesService.updateMatches()
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess() {
    const nextUpdate = new Date(Date.now() + this.getInterval());
    this.job.schedule(nextUpdate)
  }

  private getInterval() {
    return this.interval;
  }

  private setInterval(value: number) {
    this.interval = value;
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = CurrentRoundMatchesScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
