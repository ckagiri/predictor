export type SchedulerOptions = {
  cron?: string,
  interval?: number,
  runImmediately?: boolean,
};

export interface Scheduler {
  startJob(options?: SchedulerOptions): void
  jobTask(): Promise<any>;
  cancelJob(): void;
  jobSuccess(result?: any, reschedule?: boolean): void;
  runJob?(): any
};
