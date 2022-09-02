import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";
import { SeasonNextRoundService, SeasonNextRoundServiceImpl } from "./season.nextRound.service";
import mongoose, { ConnectOptions } from "mongoose";
import { BaseScheduler } from "../baseScheduler";

export class SeasonNextRoundScheduler extends BaseScheduler {
  public static getInstance(
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new SeasonNextRoundScheduler(seasonNextRoundService, eventMediator);
  }

  constructor(
    private seasonNextRoundService: SeasonNextRoundService,
    private eventMediator: EventMediator,
  ) {
    super('SeasonNextRound Job');
  }

  async task() {
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
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
