import { LeaderboardService, LeaderboardServiceImpl } from './leaderboard.service';
import { PredictionService, PredictionServiceImpl } from './prediction.service';
import { BaseScheduler } from './baseScheduler';
import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H

export class LeaderboardScheduler extends BaseScheduler {
  public static getInstance(
    leaderboardService = LeaderboardServiceImpl.getInstance(),
    predictionService = PredictionServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new LeaderboardScheduler(leaderboardService, predictionService, eventMediator);
  }

  constructor(
    private leaderboardService: LeaderboardService,
    private predictionService: PredictionService,
    private eventMediator: EventMediator
  ) {
    super('LeaderboardJob');
    this.eventMediator.addListener(
      'footballApiMatchUpdatesCompleted', async () => {
        console.log(`${this.job.name} handle footballApiMatchUpdatesCompleted`);
        await this.runJob();
      }
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
