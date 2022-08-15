
import { Scheduler, SchedulerOptions } from "../scheduler";
import schedule, { Job } from "node-schedule";
import { getMatchStatus } from "./util";
import { MatchStatus } from "../../../db/models/match.model";
import moment from "moment";
import mongoose, { ConnectOptions } from "mongoose";
import { YesterToMorrowService, YesterToMorrowServiceImpl } from "./matches.yesterToMorrow.service";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class YesterToMorrowScheduler implements Scheduler {
  private job: Job = new schedule.Job('YesterToMorrowScheduler Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number | undefined = undefined;

  public static getInstance(
    yesterToMorrowService = YesterToMorrowServiceImpl.getInstance(),
  ) {
    return new YesterToMorrowScheduler(yesterToMorrowService);
  }

  constructor(
    private yesterToMorrowService: YesterToMorrowService,
  ) {
    this.job.on('success', () => {
      this.scheduleJob();
    });
    this.job.on('scheduled', (scheduleDate: any) => {
      // todo
      // if diff(this.scheduleDate, now) < 120 && diff(scheduleDate, now) > 120
      // publish if lastUpdate was 2 mins ago and nextUpdate is 2+ mins later
    })
  }

  startJob(options: SchedulerOptions = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    this.setInterval(interval as number);
    if (runImmediately) {
      this.jobTask().then(result => {
        this.scheduleJob(result);
      });
    } else {
      this.scheduleJob();
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    const includeYesterdayAndTomorrowMatches = this.getInterval() > DEFAULT_INTERVAL;
    const apiMatches = await this.yesterToMorrowService.updateMatches(includeYesterdayAndTomorrowMatches);
    this.taskRunning = false;
    return apiMatches;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  scheduleJob(result: any = [], reschedule: boolean = false) {
    const apiMatches = result as any[];
    const nextInterval = calculateNextInterval(apiMatches)
    const nextUpdate = new Date(Date.now() + nextInterval);

    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async runJob() {
    const result = await this.jobTask();
    this.scheduleJob(result, true);
  }

  private getInterval(): number {
    return this.interval ?? DEFAULT_INTERVAL;
  }

  private setInterval(value: number) {
    this.interval = value;
  }
}

export function calculateNextInterval(apiMatches: any[]): number {
  const now = moment();
  let nextUpdate = moment().add(12, 'hours');
  const finishedMatches = apiMatches.filter(m => getMatchStatus(m.status) === MatchStatus.FINISHED);
  let hasLiveMatch = false;
  for (const match of finishedMatches) {
    const matchStatus = getMatchStatus(match.status)
    if (matchStatus === MatchStatus.LIVE) {
      hasLiveMatch = true;
      break;
    }
    if (matchStatus === MatchStatus.SCHEDULED) {
      const matchStart = moment(match.utcDate);
      const diff = matchStart.diff(now, 'minutes');
      if (diff <= 5) {
        hasLiveMatch = true;
        break;
      }
      if (matchStart.isAfter(now) && matchStart.isBefore(nextUpdate)) {
        nextUpdate = matchStart;
      }
    }
  }

  if (hasLiveMatch) {
    nextUpdate = moment().add(90, 'seconds');
  }

  return nextUpdate.diff(moment())
}


(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = YesterToMorrowScheduler.getInstance();
  scheduler.startJob({ interval: DEFAULT_INTERVAL + 1, runImmediately: true });
})();
