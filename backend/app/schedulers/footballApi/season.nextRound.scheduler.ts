import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";
import { SeasonNextRoundService, SeasonNextRoundServiceImpl } from "./season.nextRound.service";
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
    super('SeasonNextRoundJob');
  }

  async task() {
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
    if (updatedSeasons.length) {
      console.log(`${this.job.name} publish currentSeasonCurrentRoundUpdated`);
      this.eventMediator.publish('currentSeasonCurrentRoundUpdated')
    }
  }
}
