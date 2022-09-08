import { EventMediator, EventMediatorImpl } from "../../common/eventMediator";
import { PredictionsService, PredictionsServiceImpl } from "./Predictions.service";
import { BaseScheduler } from "./baseScheduler";

export class MakePredictionsScheduler extends BaseScheduler {
  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    predictionsService = PredictionsServiceImpl.getInstance(),
  ) {
    return new MakePredictionsScheduler(eventMediator, predictionsService);
  }

  constructor(
    private eventMediator: EventMediator,
    private predictionsService: PredictionsService
  ) {
    super('MakePredictions Job');
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated', async () => { await this.runJob() }
    );
  }

  async task() {
    await this.predictionsService.createIfNotExistsCurrentRoundPredictions();
  }
}
