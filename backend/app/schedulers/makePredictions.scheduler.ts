import { EventMediator, EventMediatorImpl } from "../../common/eventMediator";
import { PredictionService, PredictionServiceImpl } from "./prediction.service";
import { BaseScheduler } from "./baseScheduler";

export class MakePredictionsScheduler extends BaseScheduler {
  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    predictionsService = PredictionServiceImpl.getInstance(),
  ) {
    return new MakePredictionsScheduler(eventMediator, predictionsService);
  }

  constructor(
    private eventMediator: EventMediator,
    private predictionsService: PredictionService
  ) {
    super('MakePredictionsJob');
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated', async () => {
        console.log(`${this.job.name} handle currentSeasonCurrentRoundUpdated`);
        await this.runJob()
      }
    );
  }

  async task() {
    await this.predictionsService.createIfNotExistsCurrentRoundPredictions();
  }
}
