import {
  EventMediator,
  EventMediatorImpl,
} from '../../common/eventMediator.js';
import { BaseScheduler } from './baseScheduler.js';
import {
  PredictionService,
  PredictionServiceImpl,
} from './prediction.service.js';

export class PredictionPointsScheduler extends BaseScheduler {
  constructor(
    private eventMediator: EventMediator,
    private predictionService: PredictionService
  ) {
    super('PredictionPointsJob');
    this.eventMediator.addListener('liveMatchUpdateFinished', async () => {
      console.log(`${this.job.name} handle liveMatchUpdateFinished`);
      await this.runJob();
    });
    this.eventMediator.addListener('lastliveMatchUpdateFinished', async () => {
      console.log(`${this.job.name} handle lastliveMatchUpdateFinished`);
      await this.runJob();
      this.eventMediator.publish(
        'lastLiveMatchUpdate_predictionPointsCalculated'
      );
    });
  }

  static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    predictionService = PredictionServiceImpl.getInstance()
  ): PredictionPointsScheduler {
    return new PredictionPointsScheduler(eventMediator, predictionService);
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
  }
}
