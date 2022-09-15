import mongoose, { ConnectOptions } from 'mongoose';
import { AppSchedule } from './appSchedule';

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
  LOCAL_MONGO
} = process.env;
const appSchedule = AppSchedule.getInstance();

const mongoOnAtlasUri = `mongodb+srv://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD!)}@${MONGO_HOSTNAME}/${MONGO_DB}?retryWrites=true&w=majority`;
const mongoUri = `mongodb://${LOCAL_MONGO}:${MONGO_PORT}/${MONGO_DB}`;
let dbUri = '';

console.log(`(FORK) process.env.DATA_OPTION=${process.env.DATA_OPTION}`);
if (process.env.DATA_OPTION === 'local_mongo') {
  dbUri = mongoUri;
} else if (process.env.DATA_OPTION === 'cloud_mongo') {
  dbUri = mongoOnAtlasUri;
} else {
  console.error('(FORK) DATA_OPTION ENV variable missing');
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
