import { CurrentRoundMatchesService, CurrentRoundMatchesServiceImpl } from './matches.currentRound.service';
import mongoose, { ConnectOptions } from "mongoose";
import { BaseScheduler } from "../BaseScheduler";

const DEFAULT_INTERVAL_MILLISECONDS = 12 * 60 * 60 * 1000; // 12H

export class CurrentRoundMatchesScheduler extends BaseScheduler {
  public static getInstance(
    currentRoundMatchesService = CurrentRoundMatchesServiceImpl.getInstance()
  ) {
    return new CurrentRoundMatchesScheduler(currentRoundMatchesService);
  }

  constructor(
    private currentRoundMatchesService: CurrentRoundMatchesService
  ) {
    super('CurrentRoundMatches Job');
  }

  async task() {
    await this.currentRoundMatchesService.updateMatches();
    console.log('CurrentRoundMatchesScheduler task done')
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = CurrentRoundMatchesScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
