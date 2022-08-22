import mongoose, { ConnectOptions } from 'mongoose';

import { CalculatePredictionsService, CalculatePredictionsServiceImpl } from './calculatePredictions.service';
import { BaseScheduler } from './baseScheduler';

const DEFAULT_INTERVAL_MILLISECONDS = 8 * 60 * 60 * 1000; // 8H

export class CalculatePredictionsScheduler extends BaseScheduler {
  public static getInstance(
    calculatePredictionsService = CalculatePredictionsServiceImpl.getInstance()
  ) {
    return new CalculatePredictionsScheduler(calculatePredictionsService);
  }

  constructor(private calculatePredictionsService: CalculatePredictionsService) {
    super('CalculatePredictions Job');
  }

  async task() {
    await this.calculatePredictionsService.updatePredictionPoints();
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

  const scheduler = CalculatePredictionsScheduler.getInstance();
  scheduler.startJob({ runImmediately: true });
})();
