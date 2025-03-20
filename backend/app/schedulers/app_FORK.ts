import mongoose, { ConnectOptions } from 'mongoose';
import { AppSchedule } from './appSchedule';

const appSchedule = AppSchedule.getInstance();
const dbUri = process.env.MONGO_URI as string;
if (!dbUri) {
  console.error('MONGO_URI ENV variable missing',);
  process.exit(1);
}

(async () => await connectWithRetry())();

async function connectWithRetry() {
  try {
    await mongoose.connect(
      dbUri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions);
    console.info("Connected to MongoDB server");
    await appSchedule.start();
    console.info('schedulers started');
  } catch (err: any) {
    console.error(`ERROR CONNECTING TO MONGO: ${err}`);
    console.error(`Please make sure that ${dbUri} is running.`);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(5000);
    await connectWithRetry()
  }
}

process.on('SIGINT', function () {
  console.log('MongoDB connection close on app termination');
  appSchedule.shutdown();
  process.exit(0);
});

process.on('SIGUSR2', function () {
  console.log('MongoDB connection close on app restart');
  mongoose.connection.close();
  process.kill(process.pid, 'SIGUSR2');
});

console.log('FORK_RUNNING');

process.on('uncaughtException', async function (err) {
  console.log({ msg: 'RESTART_FORK', Error: 'app_FORK.js uncaughtException error: ' + err.message + "\n" + err.stack });
  await appSchedule.shutdown();
  process.disconnect();
});

process.on('message', function (m: any) {
  console.log('Message from master:', m);
  appSchedule.publish(m.message);
});
