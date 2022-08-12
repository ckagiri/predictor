import schedule, { Job } from "node-schedule";
import { Scheduler, SchedulerOptions } from "../scheduler";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000; // 7H

class SeasonScheduler implements Scheduler {
  private job: Job = new schedule.Job('CurrentRoundMatches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  startJob({ interval = DEFAULT_INTERVAL, runImmediately }: SchedulerOptions): void {
    if (this.jobScheduled) throw new Error('Job already scheduled');
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

    throw new Error("Method not implemented.");
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
