import { Queue } from '../queue';

export interface Job {
  start(queue: Queue): any;
}
