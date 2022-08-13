import { Scheduler, SchedulerOptions } from "./scheduler";

class MakePredictionsScheduler implements Scheduler {
  startJob({ interval, runImmediately }: SchedulerOptions): void {
    throw new Error("Method not implemented.");
  }
  jobTask(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  cancelJob(): void {
    throw new Error("Method not implemented.");
  }
  jobSuccess(result?: any, reschedule?: boolean | undefined): void {
    throw new Error("Method not implemented.");
  }
}
