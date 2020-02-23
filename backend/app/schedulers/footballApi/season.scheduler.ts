import { EventEmitter } from 'events';
import { Scheduler } from '../../schedulers';
import { TaskRunner, TaskRunnerImpl } from '../taskRunner';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../../thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { SeasonUpdater, SeasonUpdaterImpl } from './season.updater';

export class SeasonScheduler extends EventEmitter implements Scheduler {
  public static getInstance(provider: ApiProvider) {
    return new SeasonScheduler(
      new TaskRunnerImpl(),
      FootballApiClientImpl.getInstance(provider),
      SeasonUpdaterImpl.getInstance(provider),
    );
  }
  private POLLING_INTERVAL = 12 * 60 * 60 * 1000;
  private _pollingInterval = 0;
  private _polling = false;

  constructor(
    private taskRunner: TaskRunner,
    private apiClient: FootballApiClient,
    private seasonUpdater: SeasonUpdater,
  ) {
    super();
  }

  get IsPolling() {
    return this._polling;
  }

  get PollingInterval() {
    return this._pollingInterval;
  }

  public start = async () => {
    this._polling = true;
    while (this._polling) {
      await this.taskRunner.run({
        whenToExecute: this._pollingInterval,
        context: this,
        task: async () => {
          const competitions = await this.apiClient.getCompetitions(2017);
          await this.seasonUpdater.updateCurrentMatchRound(competitions);
          this._pollingInterval = this.POLLING_INTERVAL;
          this.onTaskExecuted();
        },
      });
    }
  };

  public stop = async () => {
    await Promise.resolve().then(() => {
      this._polling = false;
      this.emit('stopped');
    });
  };

  public onTaskExecuted = () => {
    this.emit('task:executed');
  };
}
