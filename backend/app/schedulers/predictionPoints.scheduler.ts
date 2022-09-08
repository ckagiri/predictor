import { PredictionsService, PredictionsServiceImpl } from './predictions.service';
import { BaseScheduler } from './baseScheduler';
import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';
import { LeaderboardService, LeaderboardServiceImpl } from './leaderboard.service';

export class PredictionPointsScheduler extends BaseScheduler {
  public static getInstance(
    predictionsService = PredictionsServiceImpl.getInstance(),
    leaderboardService = LeaderboardServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new PredictionPointsScheduler(predictionsService, leaderboardService, eventMediator);
  }

  constructor(
    private predictionsService: PredictionsService,
    private leaderboardService: LeaderboardService,
    private eventMediator: EventMediator
  ) {
    super('PredictionPoints Job');
    this.eventMediator.addListener(
      'footballApiMatchUpdatesCompleted', async () => { await this.runJob() }
    );
  }

  async task() {
    await this.predictionsService.calculatePredictionPoints();
    await this.leaderboardService.updateGlobalLeaderboards();
  }
}
