export type SchedulerOptions = {
  interval?: string | number,
  runImmediately?: boolean,
};

export interface Scheduler {
  startJob(options?: SchedulerOptions): void
  jobTask(): Promise<any>;
  cancelJob(): void;
  scheduleJob(result?: any, reschedule?: boolean): void;
  runJob?(): any
};
