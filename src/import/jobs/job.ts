import { Queue } from "../queue";

export interface IJob {
  start(queue: Queue): any;
}
