import { MainJob as ApiFootballDataMainJob } from '../apiFootballData/main.job.js';
import { Job } from './job.js';

export const MainJob = {
  getInstance(): Job {
    return ApiFootballDataMainJob.getInstance();
  },
};
