import { ChildProcess } from 'child_process';

export interface BackgroundWorker {
  send(messageData: { data: any; msg: string }): void;
}

export const BackgroundWorkerImpl = {
  getInstance(nodeWorker: ChildProcess): BackgroundWorker {
    return {
      send: messageData => {
        nodeWorker.send(messageData);
      },
    };
  },
};
