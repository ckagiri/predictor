import { Job } from './jobs/job';

export class Queue {
  public tokensInInterval: number;
  public tokensLeftInInterval: number;
  public timeInterval: number;
  public jobs: Job[];
  public pendingJobs: any[];
  public isActive: boolean;
  public timer: any;
  public onComplete: () => void;

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

  public addJob = (job: Job) => {
    this.jobs.push(job);
    if (!this.isActive) {
      this.start();
    }
  };

  public processJobQueue = () => {
    if (this.jobs.length > 0) {
      const job = this.jobs.pop() as Job;
      this.processLastJob(job);
    } else {
      this.cleanUp();
    }
  };

  public processLastJob = (job: Job) => {
    const wrappedJob = this.wrapJob(job);
    wrappedJob();
  };

  public wrapJob = (job: Job) => {
    const self = this;
    return async () => {
      if (self.tokensLeftInInterval > 0) {
        self.tokensLeftInInterval -= 1;
        try {
          await job.start(this);
          self.processJobQueue();
        } catch (error) {
          // tslint:disable-next-line: no-console
          console.error(error);
          self.cleanUp();
        }
      } else {
        const wrappedJob = self.wrapJob(job);
        self.pendingJobs.push(wrappedJob);
      }
    };
  };

  public cleanUp = () => {
    if (this.isActive) {
      clearInterval(this.timer);
      this.timer = null;
      this.isActive = false;
      this.onComplete();
    }
  };
}
