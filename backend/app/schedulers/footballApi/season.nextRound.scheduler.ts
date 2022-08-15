import schedule, { Job } from "node-schedule";
import { Scheduler, SchedulerOptions } from "../scheduler";
import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";
import { SeasonNextRoundService, SeasonNextRoundServiceImpl } from "./season.nextRound.service";
import mongoose, { ConnectOptions } from "mongoose";
import { isString } from "lodash";

const DEFAULT_INTERVAL = 12 * 60 * 60 * 1000; // 12H

const SCHEDULE_TYPE = {
  LOOP: 'loop',
  CRON: 'cron',
}

export class SeasonNextRoundScheduler implements Scheduler {
  private job: Job = new schedule.Job('SeasonNextRound Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: string | number | undefined = undefined;
  private scheduleType: string = SCHEDULE_TYPE.LOOP;

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance()
  ) {
    return new SeasonNextRoundScheduler(eventMediator, seasonNextRoundService);
  }

  constructor(
    private eventMediator: EventMediator,
    private seasonNextRoundService: SeasonNextRoundService,
  ) {
    this.job.on('success', () => {
      this.jobSuccess();
    });
  }

  startJob(options: SchedulerOptions = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    if (runImmediately) {
      this.jobTask().then(() => this.scheduleJob(interval));
    } else {
      this.scheduleJob(interval)
    }
  }

  scheduleJob(interval?: string | number) {
    if (isString(interval)) {
      this.setScheduleType(SCHEDULE_TYPE.CRON)
      this.job.schedule(interval);
    } else {
      this.setScheduleType(SCHEDULE_TYPE.LOOP)
      this.setInterval(interval as number);
      this.job.schedule(new Date(Date.now() + this.getInterval()));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    await new Promise(resolve => setTimeout(resolve, 10));
    const updatedSeasons = [];// await this.seasonNextRoundService.updateSeasons();
    if (updatedSeasons.length) {
      this.eventMediator.publish('currentSeasonCurrentRoundUpdated')
    }
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
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

  const scheduler = SeasonNextRoundScheduler.getInstance();
  scheduler.startJob({ interval: '5 * * * * *', runImmediately: true });
})();
