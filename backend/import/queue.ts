import { Job } from './jobs/job.js';

export class Queue {
  public isActive: boolean;
  public jobs: Job[];
  public onComplete: () => void;
  public pendingJobs: any[];
  public timeInterval: number;
  public timer: any;
  public tokensInInterval: number;
  public tokensLeftInInterval: number;

  constructor(limit: number, timeInterval: number) {
    this.tokensInInterval = limit;
    this.tokensLeftInInterval = limit;
    this.timeInterval = timeInterval;
    this.isActive = false;
    this.jobs = [];
    this.pendingJobs = [];
    this.onComplete = () => {
      /**/
    };
  }

  public addJob = (job: Job) => {
    this.jobs.push(job);
    if (!this.isActive) {
      this.start();
    }
  };

  public cleanUp = () => {
    if (this.isActive) {
      clearInterval(this.timer);
      this.timer = null;
      this.isActive = false;
      this.onComplete();
    }
  };

  public processJobQueue = () => {
    if (this.jobs.length > 0) {
      const job = this.jobs.pop()!;
      this.processLastJob(job);
    } else {
      this.cleanUp();
    }
  };

  public processLastJob = (job: Job) => {
    const wrappedJob = this.wrapJob(job);
    void wrappedJob();
  };

  public start = () => {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.startTimer();
    this.processJobQueue();
  };

  public startTimer = () => {
    this.timer = setInterval(() => {
      this.tokensLeftInInterval = this.tokensInInterval;
      while (this.pendingJobs.length > 0) {
        if (this.tokensLeftInInterval > 0) {
          const pendingJob = this.pendingJobs.pop();
          pendingJob();
        } else {
          break;
        }
      }
      if (this.pendingJobs.length === 0 && this.jobs.length === 0) {
        this.cleanUp();
      }
    }, this.timeInterval);
  };

  public wrapJob = (job: Job) => {
    return async () => {
      if (this.tokensLeftInInterval > 0) {
        this.tokensLeftInInterval -= 1;
        try {
          await job.start(this);
          this.processJobQueue();
        } catch (error) {
          console.error(error);
          this.cleanUp();
        }
      } else {
        const wrappedJob = this.wrapJob(job);
        this.pendingJobs.push(wrappedJob);
      }
    };
  };
}
