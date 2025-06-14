export interface SchedulerOptions {
  interval?: number | string;
  runImmediately?: boolean;
}

export const SCHEDULE_TYPE = {
  CRON: 'cron',
  LOOP: 'loop',
};

export interface Scheduler {
  cancelJob(): void;
  jobTask(): Promise<any>;
  runJob?(): any;
  scheduleJob(result?: any, reschedule?: boolean): void;
  startJob(options?: SchedulerOptions): Promise<void>;
}
