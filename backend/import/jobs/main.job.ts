import { IJob } from './job';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { MainJob as ApiFootballDataMainJob } from '../apiFootballData/main.job';

export abstract class MainJob {
  public static getInstance(provider: ApiProvider): IJob {
    return ApiFootballDataMainJob.getInstance();
  }
}
