import { Scheduler, SchedulerOptions } from "../scheduler";
import schedule, { Job } from "node-schedule";
import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './matches.currentRound.service';
import mongoose, { ConnectOptions } from "mongoose";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000; // 7H

export class CurrentRoundMatchesScheduler implements Scheduler {
  private job: Job = new schedule.Job('CurrentRoundMatches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number | undefined = undefined;

  public static getInstance(
    currentRoundMatchesService = CurrentRoundMatchesServiceImpl.getInstance()
  ) {
    return new CurrentRoundMatchesScheduler(currentRoundMatchesService);
  }

  constructor(
    private currentRoundMatchesService: CurrentRoundMatchesService
  ) {
    this.job.on('success', () => {
      this.scheduleJob();
    });
  }

  startJob(options: SchedulerOptions = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    this.setInterval(interval as number);
    if (runImmediately) {
      this.jobTask().then(() => {
        this.scheduleJob();
      });
    } else {
      this.scheduleJob();
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

  scheduleJob() {
    this.job.schedule(new Date(Date.now() + this.getInterval()))
  }

  private getInterval(): number {
    return this.interval ?? DEFAULT_INTERVAL;
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
