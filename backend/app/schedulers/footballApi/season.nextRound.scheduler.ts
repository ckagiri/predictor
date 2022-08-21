import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";
import { SeasonNextRoundService, SeasonNextRoundServiceImpl } from "./season.nextRound.service";
import mongoose, { ConnectOptions } from "mongoose";
import { BaseScheduler } from "../baseScheduler";

export class SeasonNextRoundScheduler extends BaseScheduler {
  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance()
  ) {
    return new SeasonNextRoundScheduler(eventMediator, seasonNextRoundService);
  }

  constructor(
    private eventMediator: EventMediator,
    private seasonNextRoundService: SeasonNextRoundService,
  ) {
    super('SeasonNextRound Job');
  }

  async task() {
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
    console.log('SeasonNextRoundScheduler task done')
    if (updatedSeasons.length) {
      this.eventMediator.publish('currentSeasonCurrentRoundUpdated')
    }
  }
}

// (async () => {
//   await mongoose.connect(process.env.MONGO_URI!, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

//   const scheduler = SeasonNextRoundScheduler.getInstance();
//   scheduler.startJob({ interval: '0,15,30,45 * * * * *' });
// })();
