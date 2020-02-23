import { EventEmitter } from 'events';
import { TaskRunnerImpl } from './taskRunner';
import { EventMediator } from '../../common/eventMediator';
import { FinishedMatchesProcessor } from './finishedMatches.processor';
import { Scheduler } from '../schedulers';

export class FinishedMatchesScheduler extends EventEmitter
  implements Scheduler {
  private _processing = false;
  private _running = false;
  private RUN_INTERVAL = 10 * 60 * 60 * 1000;

  constructor(
    private taskRunner: TaskRunnerImpl,
    // private matchRepo: MatchRepository,
    private finishedMatchesProcessor: FinishedMatchesProcessor,
    private eventMediator: EventMediator,
  ) {
    super();
    this.eventMediator.addListener(
      'process:predictions',
      this.processPredictions,
    );
  }

  get IsRunning() {
    return this._running;
  }

  get IsProcessing() {
    return this._processing;
  }

  public start = async () => {
    this._running = true;
    while (this._running) {
      await this.taskRunner.run({
        whenToExecute: this.RUN_INTERVAL,
        context: this,
        task: async () => {
          await this.processFinishedMatches();
          this.emit('task:executed');
        },
      });
    }
  };

  public stop = async () => {
    await Promise.resolve().then(() => {
      this._running = false;
      this.emit('stopped');
    });
  };

  public processFinishedMatches = async () => {
    if (this._processing) {
      return;
    }
    // let matches = await this.matchRepo.findAllFinishedWithPendingPredictions$();
    // await processPredictions(fs);
  };

  public processPredictions = async (finishedMatches: any[]) => {
    if (Array.isArray(finishedMatches) && finishedMatches.length) {
      await this.finishedMatchesProcessor.processPredictions(finishedMatches);
      // await leaderboardUpdater.updateScores(finishedMatches)
      // await leaderboardUpdater.updateRankigs()
      // await leaderboardUpdater.markLeaderboardsAsRefreshed()
      // await finishedMatchesProcessor.setToTrueAllPredictionsProcessed(matches)
    }
    this.eventMediator.publish('predictions:processed');
  };
}
