import {
  EventMediator,
  EventMediatorImpl,
} from '../../common/eventMediator.js';
import { BaseScheduler } from './baseScheduler.js';
import {
  LeaderboardService,
  LeaderboardServiceImpl,
} from './leaderboard.service.js';
import {
  PredictionService,
  PredictionServiceImpl,
} from './prediction.service.js';

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H

export class LeaderboardScheduler extends BaseScheduler {
  constructor(
    private leaderboardService: LeaderboardService,
    private predictionService: PredictionService,
    private eventMediator: EventMediator
  ) {
    super('LeaderboardJob');
    this.eventMediator.addListener(
      'footballApiMatchUpdatesCompleted',
      async () => {
        console.log(`${this.job.name} handle footballApiMatchUpdatesCompleted`);
        await this.runJob();
      }
    );
  }

  public static getInstance(
    leaderboardService = LeaderboardServiceImpl.getInstance(),
    predictionService = PredictionServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance()
  ) {
    return new LeaderboardScheduler(
      leaderboardService,
      predictionService,
      eventMediator
    );
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
    await this.leaderboardService.updateGlobalLeaderboards();
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
