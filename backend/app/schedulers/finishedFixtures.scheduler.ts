import { EventEmitter } from 'events';
import { ITaskRunner } from './taskRunner';
import { IEventMediator } from '../../common/eventMediator';
import { IFinishedFixturesProcessor } from './finishedFixtures.processor';
import { IScheduler } from '../schedulers';

export class FinishedFixturesScheduler extends EventEmitter implements IScheduler {
  private _processing = false;
  private _running = false;
  private RUN_INTERVAL = 10 * 60 * 60 * 1000;

  constructor(
    private taskRunner: ITaskRunner,
    //private fixtureRepo: IFixtureRepository,
    private finishedFixturesProcessor: IFinishedFixturesProcessor,
    private eventMediator: IEventMediator
  ) {
    super();
    this.eventMediator.addListener('process:predictions', this.processPredictions);
  }

  get IsRunning() {
    return this._running;
  }

  get IsProcessing() {
    return this._processing;
  }

  start = async () => {
    this._running = true;
    while (this._running) {
      await this.taskRunner.run({
        whenToExecute: this.RUN_INTERVAL,
        context: this,
        task: async () => {
          await this.processFinishedFixtures();
          this.emit('task:executed');
        }
      });
    }
  };

  stop = async () => {
    await Promise.resolve().then(() => {
      this._running = false;
      this.emit('stopped');
    });
  };

  processFinishedFixtures = async () => {
    if (this._processing) {
      return;
    }
    //let fixtures = await this.fixtureRepo.findAllFinishedWithPendingPredictions$();
    // await processPredictions(fs);
  };

  processPredictions = async (finishedFixtures: any[]) => {
    if (Array.isArray(finishedFixtures) && finishedFixtures.length) {
      await this.finishedFixturesProcessor.processPredictions(finishedFixtures);
      // await leaderboardUpdater.updateScores(finishedFixtures)
      //await leaderboardUpdater.updateRankigs()
      //await leaderboardUpdater.markLeaderboardsAsRefreshed()
      //await finishedFixturesProcessor.setToTrueAllPredictionsProcessed(fixtures)
    }
    this.eventMediator.publish('predictions:processed');
  };
}
