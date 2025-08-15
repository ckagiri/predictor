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
    private eventMediator: EventMediator,
    private seasonNextRoundService: SeasonNextRoundService
  ) {
    super('SeasonNextRoundJob');
  }

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    seasonNextRoundService = SeasonNextRoundServiceImpl.getInstance()
  ) {
    return new SeasonNextRoundScheduler(eventMediator, seasonNextRoundService);
  }

  async task() {
    const updatedSeasons = await this.seasonNextRoundService.updateSeasons();
    if (updatedSeasons.length) {
      console.log(`${this.job.name} publish currentSeasonCurrentRoundUpdated`);
      this.eventMediator.publish('currentSeasonCurrentRoundUpdated');
    }
  }
}
