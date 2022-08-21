import mongoose, { ConnectOptions } from 'mongoose';

const mongoUri = process.env.MONGO_URI!;
(async function () {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
  console.log("Connected to MongoDB server");
}());

process.on('SIGINT', function () {
  console.log('MongoDB connection close on app termination');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGUSR2', function () {
  console.log('MongoDB connection close on app restart');
  mongoose.connection.close();
  process.kill(process.pid, 'SIGUSR2');
});

console.log({ msg: 'FORK_RUNNING' });

process.on('uncaughtException', function (err) {
  console.log({ msg: 'RESTART_FORK', Error: 'app_FORK.js uncaughtException error: ' + err.message + "\n" + err.stack });
  // scheduler shutdown
  process.disconnect();
})

process.on('message', function (m: any) {
  if (m.msg) {
    console.log('msg', m)
  } else {
    console.log('Message from master:', m);
  }
});
