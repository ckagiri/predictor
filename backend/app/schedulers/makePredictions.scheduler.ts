import schedule, { Job } from "node-schedule";
import { Scheduler } from "./scheduler";
import { EventMediator, EventMediatorImpl } from "../../common/eventMediator";
import { MakePredictionsService, MakePredictionsServiceImpl } from "./makePredictions.service";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;
export class MakePredictionsScheduler implements Scheduler {
  private job: Job = new schedule.Job('MakePredictions Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number | undefined = undefined;

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    makePredictionsService = MakePredictionsServiceImpl.getInstance(),
  ) {
    return new MakePredictionsScheduler(eventMediator, makePredictionsService);
  }

  constructor(
    private eventMediator: EventMediator,
    private makePredictionsService: MakePredictionsService
  ) {
    this.job.on('success', () => {
      this.scheduleJob();
    });
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated', async () => { await this.runJob() }
    );
  }

  startJob(options = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
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
    await this.makePredictionsService.createCurrentRoundPredictionsIfNotExists();
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  scheduleJob(_result?: any, reschedule: boolean = false) {
    const nextUpdate = new Date(Date.now() + this.getInterval());
    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async runJob() {
    await this.jobTask();
    this.scheduleJob(undefined, true);
  }

  private getInterval() {
    return this.interval ?? DEFAULT_INTERVAL;
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

//   const scheduler = MakePredictionsScheduler.getInstance();
//   scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
// })();
