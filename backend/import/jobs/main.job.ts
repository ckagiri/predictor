import { Job } from './job';
import { MainJob as ApiFootballDataMainJob } from '../apiFootballData/main.job';

export abstract class MainJob {
  public static getInstance(): Job {
    return ApiFootballDataMainJob.getInstance();
  }
}
