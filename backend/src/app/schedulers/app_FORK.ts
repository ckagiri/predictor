import mongoose from 'mongoose';

import getDbUri from '../../common/getDbUri.js';
import { AppSchedule } from './appSchedule.js';

const appSchedule = AppSchedule.getInstance();
const dbUri = getDbUri();

(async () => {
  await connectWithRetry();
})().catch((err: unknown) => {
  console.error('Unhandled error in async IIFE:', err);
  process.exit(1);
});

async function connectWithRetry() {
  try {
    await mongoose.connect(dbUri);
    console.info('Connected to MongoDB server');
    await appSchedule.start();
    console.info('schedulers started');
  } catch (err: any) {
    console.error(`ERROR CONNECTING TO MONGO: ${err}`);
    console.error(`Please make sure that ${dbUri} is running.`);

    const delay = (ms: number) =>
      new Promise(resolve => setTimeout(resolve, ms));
    await delay(5000);
    await connectWithRetry();
  }
}

process.on('SIGINT', function () {
  console.log('MongoDB connection close on app termination');
  void appSchedule.shutdown();
  process.exit(0);
});

process.on('SIGUSR2', function () {
  console.log('MongoDB connection close on app restart');
  void mongoose.connection.close();
  process.kill(process.pid, 'SIGUSR2');
});

console.log('FORK_RUNNING');

process.on('uncaughtException', function (err: unknown) {
  console.log({
    Error:
      'app_FORK.js uncaughtException error: ' +
      String((err && (err as any).message) ?? '') +
      '\n' +
      String((err && (err as any).stack) ?? ''),
    msg: 'RESTART_FORK',
  });
  // Shutdown asynchronously, but don't return a Promise
  void appSchedule.shutdown().finally(() => {
    if (typeof process.disconnect === 'function') {
      process.disconnect();
    }
  });
});

process.on('message', function (m: any) {
  if (m?.msg) {
    if (m.msg === 'REPICK_JOKER_IF_MATCH') {
      // With setImmediate(), callbacks run after I/O.
      // FYI: process.nextTick() queues up callbacks that run in the event loop before I/O.
      setImmediate(() => {
        appSchedule.handle(m.msg, m.data);
      });
    } else {
      console.log('Received message from main: ', m);
    }
  }
});
