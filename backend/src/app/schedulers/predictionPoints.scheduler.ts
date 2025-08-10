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
    private predictionService: PredictionService,
    private eventMediator: EventMediator
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

  public static getInstance(
    predictionsService = PredictionServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance()
  ) {
    return new PredictionPointsScheduler(predictionsService, eventMediator);
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
  }
}
