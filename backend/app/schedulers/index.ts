import mongoose, { ConnectOptions } from "mongoose";
import { SeasonNextRoundScheduler } from './footballApi/season.nextRound.scheduler'
import { MakePredictionsScheduler } from './makePredictions.scheduler';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const seasonNextRoundScheduler = SeasonNextRoundScheduler.getInstance();
  seasonNextRoundScheduler.startJob({ interval: 5 * 1000, runImmediately: true });

  const makePredictionsScheduler = MakePredictionsScheduler.getInstance();
  makePredictionsScheduler.startJob();
})();
