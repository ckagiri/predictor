import mongoose, { ConnectOptions } from 'mongoose';

import { SeasonNextRoundScheduler } from './footballApi/season.nextRound.scheduler.js';
import { MakePredictionsScheduler } from './makePredictions.scheduler.js';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  const seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
  await seasonNextRoundScheduler.startJob({
    interval: 5 * 1000,
    runImmediately: true,
  });

  const makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  await makePredictionsScheduler.startJob();
})().catch((err: unknown) => {
  console.error('Unhandled error in scheduler:', err);
  process.exit(1);
});
