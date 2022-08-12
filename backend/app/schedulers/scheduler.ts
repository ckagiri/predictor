export type SchedulerOptions = {
  interval?: number,
  runImmediately?: boolean,
};

export interface Scheduler {
  startJob({ interval, runImmediately }: SchedulerOptions): void
  jobTask(): Promise<any>;
  cancelJob(): void;
  jobSuccess(result?: any, reschedule?: boolean): void;
  runJob?(): any
};
