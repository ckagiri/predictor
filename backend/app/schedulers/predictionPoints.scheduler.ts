import { PredictionService, PredictionServiceImpl } from './prediction.service';
import { BaseScheduler } from './baseScheduler';
import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';

export class PredictionPointsScheduler extends BaseScheduler {
  public static getInstance(
    predictionsService = PredictionServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new PredictionPointsScheduler(predictionsService, eventMediator);
  }

  constructor(
    private predictionService: PredictionService,
    private eventMediator: EventMediator
  ) {
    super('PredictionPointsJob');
    this.eventMediator.addListener(
      'footballApiLiveMatchUpdatesCompleted', async () => {
        console.log(`${this.job.name} handle footballApiLiveMatchUpdatesCompleted`);
        await this.runJob();
      }
    );
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
  }
}
