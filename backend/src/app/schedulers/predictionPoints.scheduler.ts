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

  static getInstance(
    predictionService?: PredictionService,
    eventMediator?: EventMediator
  ): PredictionPointsScheduler {
    return new PredictionPointsScheduler(
      predictionService ?? PredictionServiceImpl.getInstance(),
      eventMediator ?? EventMediatorImpl.getInstance()
    );
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
  }
}
