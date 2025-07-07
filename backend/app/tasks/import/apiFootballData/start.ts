import { Queue } from '../queue.js';
import { MainJob } from './main.job.js';

export const apiFootballDataImporter = {
  start: () => {
    console.log('** starting ApiFootballData Importer');
    const q = new Queue(50, 1000 * 60);
    q.addJob(MainJob.getInstance());
    q.onComplete = () => {
      console.log('done baby!');
    };
  },
};
