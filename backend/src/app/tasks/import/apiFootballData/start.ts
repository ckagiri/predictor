import { Queue } from '../queue.js';
import { MainJob } from './main.job.js';

interface ApiFootballDataImporter {
  start: (successCb: () => void) => void;
}

export const apiFootballDataImporter: ApiFootballDataImporter = {
  start: (successCb: () => void): void => {
    console.log('** starting ApiFootballData Importer');
    const q: Queue = new Queue(50, 1000 * 60);
    q.addJob(MainJob.getInstance());
    q.onComplete = (): void => {
      console.log('done baby!');
      successCb();
    };
  },
};
