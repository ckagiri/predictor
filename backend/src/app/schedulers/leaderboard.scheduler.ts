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
    private eventMediator: EventMediator,
    private leaderboardService: LeaderboardService,
    private predictionService: PredictionService
  ) {
    super('LeaderboardJob');
    this.eventMediator.addListener(
      'lastLiveMatchUpdate_predictionPointsCalculated',
      async () => {
        console.log(
          `${this.job.name} handle lastLiveMatchUpdate_predictionPointsCalculated`
        );
        await this.runJob();
      }
    );
  }

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    leaderboardService = LeaderboardServiceImpl.getInstance(),
    predictionService = PredictionServiceImpl.getInstance()
  ) {
    return new LeaderboardScheduler(
      eventMediator,
      leaderboardService,
      predictionService
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
