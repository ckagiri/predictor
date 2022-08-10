export type SchedulerOptions = {
  interval?: number,
  runImmediately?: boolean,
};

export interface Scheduler {
  startJob({ interval, runImmediately }: SchedulerOptions): void
  jobTask(): any;
  cancelJob(): void;
  jobSuccess?(result?: any, reschedule?: boolean): void;
  runJob?(): any
};
