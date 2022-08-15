import { Scheduler, SchedulerOptions, SCHEDULE_TYPE } from "../scheduler";
import schedule, { Job } from "node-schedule";
import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './matches.currentRound.service';
import mongoose, { ConnectOptions } from "mongoose";
import { isNumber, isString } from "lodash";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000; // 7H

export class CurrentRoundMatchesScheduler implements Scheduler {
  private job: Job = new schedule.Job('CurrentRoundMatches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: string | number | undefined = undefined;
  private scheduleType: string = SCHEDULE_TYPE.LOOP;

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
    if (runImmediately) {
      this.jobTask().then(() => {
        this.scheduleJob(interval);
      });
    } else {
      this.scheduleJob(interval);
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

  scheduleJob(interval?: string | number) {
    if (isString(interval)) {
      this.setScheduleType(SCHEDULE_TYPE.CRON)
      this.job.schedule(interval);
    } else if (isNumber(interval)) {
      this.setScheduleType(SCHEDULE_TYPE.LOOP)
      this.setInterval(interval);
      this.job.schedule(new Date(Date.now() + this.getInterval()));
    } else {
      this.job.schedule(new Date(Date.now() + this.getInterval()));
    }
  }

  jobSuccess() {
    if (this.getScheduleType() === SCHEDULE_TYPE.LOOP) {
      this.job.schedule(new Date(Date.now() + this.getInterval()))
    }
  }

  private getInterval(): number {
    return this.interval as number ?? DEFAULT_INTERVAL;
  }

  private setInterval(value: number) {
    this.interval = value;
  }

  private setScheduleType(value: string) {
    this.scheduleType = value;
  }

  private getScheduleType() {
    return this.scheduleType;
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
