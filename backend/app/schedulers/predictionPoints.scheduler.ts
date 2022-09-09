import { PredictionService, PredictionServiceImpl } from './prediction.service';
import { BaseScheduler } from './baseScheduler';
import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';
import { LeaderboardService, LeaderboardServiceImpl } from './leaderboard.service';

export class PredictionPointsScheduler extends BaseScheduler {
  public static getInstance(
    predictionsService = PredictionServiceImpl.getInstance(),
    leaderboardService = LeaderboardServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new PredictionPointsScheduler(predictionsService, leaderboardService, eventMediator);
  }

  constructor(
    private predictionService: PredictionService,
    private leaderboardService: LeaderboardService,
    private eventMediator: EventMediator
  ) {
    super('PredictionPoints Job');
    this.eventMediator.addListener(
      'footballApiMatchUpdatesCompleted', async () => { await this.runJob() }
    );
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
    await this.leaderboardService.updateGlobalLeaderboards();
  }
}
