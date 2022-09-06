import mongoose, { ConnectOptions } from "mongoose";
import { EventMediator, EventMediatorImpl } from "../../common/eventMediator";
import { MakePredictionsService, MakePredictionsServiceImpl } from "./makePredictions.service";
import { BaseScheduler } from "./baseScheduler";

export class MakePredictionsScheduler extends BaseScheduler {
  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    makePredictionsService = MakePredictionsServiceImpl.getInstance(),
  ) {
    return new MakePredictionsScheduler(eventMediator, makePredictionsService);
  }

  constructor(
    private eventMediator: EventMediator,
    private makePredictionsService: MakePredictionsService
  ) {
    super('MakePredictions Job');
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated', async () => { await this.runJob() }
    );
  }

  async task() {
    await this.makePredictionsService.createIfNotExistsCurrentRoundPredictions();
  }
}

// (async () => {
//   await mongoose.connect(process.env.MONGO_URI!, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

//   const scheduler = MakePredictionsScheduler.getInstance();
//   scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
// })();
