import { EventEmitter } from 'events';
import moment from 'moment';

import { Scheduler } from '../../schedulers';
import { TaskRunner, TaskRunnerImpl } from '../taskRunner';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../../thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import {
  EventMediator,
  EventMediatorImpl,
} from '../../../common/eventMediator';
import { Match, MatchStatus } from '../../../db/models/match.model';

import { MatchesUpdater, MatchesUpdaterImpl } from './matches.updater';

export class MatchesScheduler extends EventEmitter implements Scheduler {
  public static getInstance() {
    return new MatchesScheduler(
      new TaskRunnerImpl(),
      FootballApiClientImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      MatchesUpdaterImpl.getInstance(),
      EventMediatorImpl.getInstance(),
    );
  }

  private _nextUpdate = 0;
  private _previousUpdate = 0;
  private _polling = false;

  constructor(
    private taskRunner: TaskRunner,
    private apiClient: FootballApiClient,
    private matchesUpdater: MatchesUpdater,
    private eventMedidatior: EventMediator,
  ) {
    super();
  }

  get isPolling() {
    return this._polling;
  }

  get nextUpdate() {
    return this._nextUpdate;
  }

  get previousUpdate() {
    return this._previousUpdate;
  }

  public start = async () => {
    this._polling = true;
    while (this._polling) {
      this.taskRunner.run({
        whenToExecute: this._nextUpdate,
        context: this,
        task: async () => {
          let matches: any = [];
          // next 6h
          if (this._nextUpdate > 6 * 60 * 60 * 1000) {
            const tommorowsMatchesResult = await this.apiClient.getTomorrowsMatches();
            const tommorowsMatches = tommorowsMatchesResult.data.matches;

            const yesterdaysMatchesResult = await this.apiClient.getYesterdaysMatches();
            const yesterdaysMatches = yesterdaysMatchesResult.data.matches;

            matches = [].concat(tommorowsMatches, yesterdaysMatches);
          }

          const todaysMatchesResult = await this.apiClient.getTodaysMatches();
          const todaysMatches = todaysMatchesResult.data.matches;

          matches = matches.concat(todaysMatches);
          const changedDbMatches = await this.matchesUpdater.updateGameDetails(matches);
          this._previousUpdate = this._nextUpdate;
          this._nextUpdate = this.calculateNextUpdate(matches);
          const finishedMatches = [].filter.call(
            changedDbMatches,
            (n: any) => n.status === MatchStatus.FINISHED,
          );
          this.eventMedidatior.publish('process:predictions', finishedMatches);
          this.emit('task:executed');
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

  public calculateNextUpdate = (matchList: Match[]) => {
    let nextUpdate = moment().add(12, 'hours');
    const matches = matchList.filter(f => f.status !== MatchStatus.FINISHED);
    let hasLiveMatch = false;
    for (const match of matches) {
      if (match.status === MatchStatus.IN_PLAY) {
        hasLiveMatch = true;
      } else if (match.status === MatchStatus.SCHEDULED) {
        const matchStart = moment(match.date);
        const diff = matchStart.diff(moment(), 'minutes');
        if (diff <= 5) {
          hasLiveMatch = true;
        } else if (matchStart.isAfter(moment()) && matchStart.isBefore(nextUpdate)) {
          nextUpdate = matchStart;
        }
      }
    }

    if (hasLiveMatch) {
      nextUpdate = moment().add(90, 'seconds');
    }

    return nextUpdate.diff(moment());
  };
}
