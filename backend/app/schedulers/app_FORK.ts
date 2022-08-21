import mongoose, { ConnectOptions } from 'mongoose';
import { AppSchedule } from './appSchedule';

const appSchedule = AppSchedule.getInstance();
const mongoUri = process.env.MONGO_URI!;
(async function () {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
  console.log("Connected to MongoDB server");
  await appSchedule.start();
  console.log('schedulers started')
}());

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
