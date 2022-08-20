import { isNumber, isString } from 'lodash';
import schedule, { Job } from 'node-schedule';
import { Scheduler, SchedulerOptions, SCHEDULE_TYPE } from './scheduler';

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H

export abstract class BaseScheduler implements Scheduler {
  protected readonly job: Job;
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: string | number | undefined = undefined;
  private _scheduleType: string = SCHEDULE_TYPE.LOOP;

  constructor(name: string) {
    this.job = new schedule.Job(name, this.jobTask.bind(this));
    this.job.on('success', result => {
      if (this.scheduleType === SCHEDULE_TYPE.LOOP) {
        this.scheduleJob(result);
      }
    });
  }

  startJob(options: SchedulerOptions = { runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) {
      throw new Error('Job already scheduled');
    }
    if (runImmediately) {
      this.jobTask().then(result => {
        this.initJob(interval, result);
      });
    } else {
      this.initJob(interval);
    }
  }

  initJob(interval?: string | number, result?: any) {
    if (isString(interval)) {
      this.scheduleType = SCHEDULE_TYPE.CRON;
      this.job.schedule(interval);
    } else if (isNumber(interval)) {
      this.setIntervalMs(interval);
      this.scheduleJob(result)
    } else {
      this.setIntervalMs(this.getDefaultIntervalMs())
      this.scheduleJob(result)
    }
  }

  scheduleJob(result: any, reschedule: boolean = false) {
    const nextInterval = this.calculateNextInterval(result)
    const nextUpdate = new Date(Date.now() + nextInterval);

    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    const result = await this.task();
    this.taskRunning = false;
    return result;
  }

  abstract task(): Promise<any>;

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  async runJob() {
    const result = await this.jobTask();
    this.scheduleJob(result, true);
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }

  protected calculateNextInterval(_result: any) {
    return this.getIntervalMs();
  }

  protected getIntervalMs(): number {
    return this.interval as number;
  }

  private setIntervalMs(value: number) {
    this.interval = value;
  }

  private set scheduleType(value: string) {
    this._scheduleType = value;
  }

  private get scheduleType() {
    return this._scheduleType;
  }
}
