import mongoose, { ConnectOptions } from 'mongoose';

import { CalculatePredictionsService, CalculatePredictionsServiceImpl } from './calculatePredictions.service';
import { BaseScheduler } from './baseScheduler';
import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';

const DEFAULT_INTERVAL_MILLISECONDS = 8 * 60 * 60 * 1000; // 8H

export class CalculatePredictionsScheduler extends BaseScheduler {
  public static getInstance(
    calculatePredictionsService = CalculatePredictionsServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new CalculatePredictionsScheduler(calculatePredictionsService, eventMediator);
  }

  constructor(private calculatePredictionsService: CalculatePredictionsService, private eventMediator: EventMediator) {
    super('CalculatePredictions Job');
    this.eventMediator.addListener(
      'matchesThroughExternalApiUpdated', async () => { await this.runJob() }
    );
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
