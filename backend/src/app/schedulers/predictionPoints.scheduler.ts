import {
  EventMediator,
  EventMediatorImpl,
} from '../../common/eventMediator.js';
import { BaseScheduler } from './baseScheduler.js';
import {
  PredictionService,
  PredictionServiceImpl,
} from './prediction.service.js';

export class PredictionPointsScheduler extends BaseScheduler {
  constructor(
    private eventMediator: EventMediator,
    private predictionService: PredictionService
  ) {
    super('PredictionPointsJob');
    this.eventMediator.addListener('liveMatchUpdateFinished', async () => {
      console.log(`${this.job.name} handle liveMatchUpdateFinished`);
      await this.runJob();
    });
    this.eventMediator.addListener('lastliveMatchUpdateFinished', async () => {
      console.log(`${this.job.name} handle lastliveMatchUpdateFinished`);
      await this.runJob();
      this.eventMediator.publish(
        'lastLiveMatchUpdate_predictionPointsCalculated'
      );
    });
    this.eventMediator.addListener(
      'REPICK_JOKER_IF_MATCH',
      async ({ matchId, roundId }: { matchId: string; roundId: string }) => {
        console.log(
          `Received message to repick joker for match ${matchId} and round ${roundId}`
        );
        const nbUpdates = await this.predictionService.repickJokerIfMatch({
          matchId,
          roundId,
        });
        console.log(
          `Repicked joker for ${String(nbUpdates)} prediction(s) for match ${matchId} and round ${roundId}`
        );
      }
    );
  }

  static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    predictionService = PredictionServiceImpl.getInstance()
  ): PredictionPointsScheduler {
    return new PredictionPointsScheduler(eventMediator, predictionService);
  }

  async task() {
    await this.predictionService.calculatePredictionPoints();
  }
}
