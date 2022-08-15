import schedule, { Job } from "node-schedule";
import { Scheduler } from "../scheduler";
import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";
import { SeasonNextRoundService, SeasonNextRoundServiceImpl } from "./season.nextRound.service";

const DEFAULT_INTERVAL = 12 * 60 * 60 * 1000; // 12H

export class SeasonNextRoundScheduler implements Scheduler {
  private job: Job = new schedule.Job('SeasonNextRound Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance()
  ) {
    return new SeasonNextRoundScheduler(eventMediator, seasonNextRoundService);
  }

  constructor(
    private eventMediator: EventMediator,
    private seasonNextRoundService: SeasonNextRoundService,
  ) { }

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
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
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

// (async () => {
//   await mongoose.connect(process.env.MONGO_URI!, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

//   const scheduler = SeasonNextRoundScheduler.getInstance();
//   scheduler.startJob({ interval: 10 * 1000, runImmediately: true });
// })();
