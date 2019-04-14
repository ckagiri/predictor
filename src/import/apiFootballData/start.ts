import { Queue } from '../queue'
import { MainJob } from './main.job';

export const apiFootballDataImporter = {
  start: () => {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Importer')
    const q = new Queue(50, 1000 * 60);
    q.addJob(MainJob.getInstance());
  }
}