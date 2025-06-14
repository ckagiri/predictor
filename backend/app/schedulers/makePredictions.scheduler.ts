import {
  EventMediator,
  EventMediatorImpl,
} from '../../common/eventMediator.js';
import { BaseScheduler } from './baseScheduler.js';
import {
  PredictionService,
  PredictionServiceImpl,
} from './prediction.service.js';

export class MakePredictionsScheduler extends BaseScheduler {
  constructor(
    private eventMediator: EventMediator,
    private predictionsService: PredictionService
  ) {
    super('MakePredictionsJob');
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated',
      async () => {
        console.log(`${this.job.name} handle currentSeasonCurrentRoundUpdated`);
        await this.runJob();
      }
    );
  }

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    predictionsService = PredictionServiceImpl.getInstance()
  ) {
    return new MakePredictionsScheduler(eventMediator, predictionsService);
  }

  async task() {
    await this.predictionsService.createIfNotExistsCurrentRoundPredictions();
  }
}
