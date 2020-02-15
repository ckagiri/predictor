import { EventEmitter } from 'events';
import { IScheduler } from '../../schedulers';
import { ITaskRunner, TaskRunner } from '../taskRunner';
import {
  IFootballApiClient,
  FootballApiClient as ApiClient
} from '../../../thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { ISeasonUpdater, SeasonUpdater } from './season.updater';
import { IEventMediator, EventMediator } from '../../../common/eventMediator';
import { ISeasonConverter, SeasonConverter } from '../../../db/converters/season.converter';

export class SeasonScheduler extends EventEmitter implements IScheduler {
  static getInstance(provider: ApiProvider) {
    return new SeasonScheduler(
      new TaskRunner(),
      ApiClient.getInstance(provider),
      SeasonConverter.getInstance(provider),
      SeasonUpdater.getInstance(provider),
      EventMediator.getInstance()
    );
  }
  private POLLING_INTERVAL = 24 * 60 * 60 * 1000;
  private _pollingInterval = 0;
  private _polling = false;

  constructor(
    private taskRunner: ITaskRunner,
    private apiClient: IFootballApiClient,
    private seasonConverter: ISeasonConverter,
    private seasonUpdater: ISeasonUpdater,
    private eventMediator: IEventMediator
  ) {
    super();
  }

  get IsPolling() {
    return this._polling;
  }

  get PollingInterval() {
    return this._pollingInterval;
  }

  start = async () => {
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
        }
      });
    }
  };

  stop = async () => {
    await Promise.resolve().then(() => {
      this._polling = false;
      this.emit('stopped');
    });
  };

  onTaskExecuted = () => {
    this.emit('task:executed');
  };
}
