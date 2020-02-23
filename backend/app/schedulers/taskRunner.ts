import { EventEmitter } from 'events';
import { promisify } from 'util';
const setTimeoutPromise = promisify(setTimeout);

export interface TaskRunner extends EventEmitter {
  run(opts: any): void;
}

export class TaskRunnerImpl extends EventEmitter implements TaskRunner {
  public async run({ whenToExecute, task = () => { }, context, callback }: any) {
    if (task && typeof task !== 'function') {
      throw new Error('Task must be a function');
    }
    if (callback && typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.emit('begin');
    try {
      await setTimeoutPromise(whenToExecute || 0);
      const data = await Promise.resolve().then(() => task.call(context));
      if (callback) {
        callback(data);
      }
      this.emit('end');
      this.emit('data', data);
    } catch (err) {
      this.emit('error', err);
      if (callback) {
        callback(err);
      }
    }
  }
}
