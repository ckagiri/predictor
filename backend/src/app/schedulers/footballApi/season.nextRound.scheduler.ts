import {
  EventMediator,
  EventMediatorImpl,
} from '../../../common/eventMediator.js';
import { BaseScheduler } from '../baseScheduler.js';
import {
  SeasonNextRoundService,
  SeasonNextRoundServiceImpl,
} from './season.nextRound.service.js';

export class SeasonNextRoundScheduler extends BaseScheduler {
  constructor(
    private seasonNextRoundService: SeasonNextRoundService,
    private eventMediator: EventMediator
  ) {
    super('SeasonNextRoundJob');
  }

  public static getInstance(
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance()
  ) {
    return new SeasonNextRoundScheduler(seasonNextRoundService, eventMediator);
  }

  async task() {
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
    if (updatedSeasons.length) {
      console.log(`${this.job.name} publish currentSeasonCurrentRoundUpdated`);
      this.eventMediator.publish('currentSeasonCurrentRoundUpdated');
    }
  }
}
