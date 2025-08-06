import {
  addHours,
  addMinutes,
  differenceInMilliseconds,
  isBefore,
  parseISO,
} from 'date-fns';

import {
  EventMediator,
  EventMediatorImpl,
} from '../../../common/eventMediator.js';
import { getMatchStatus, MatchStatus } from '../../../db/models/match.model.js';
import { BaseScheduler } from '../baseScheduler.js';
import {
  PERIOD,
  TodayAndMorrowService,
  TodayAndMorrowServiceImpl,
} from './matches.todayAndMorrow.service.js';

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H
interface ApiMatch {
  id: string | number;
  status: string;
  utcDate: string;
}

export class TodayAndMorrowScheduler extends BaseScheduler {
  private liveMatchHasFinished = false;
  private finishedLiveMatches: (string | number)[] = [];
  private liveMatches: (string | number)[] = [];
  private nextPoll: Date = addHours(new Date(), 8);
  private scheduleDate?: Date;

  constructor(
    private todayAndMorrowService: TodayAndMorrowService,
    private eventMediator: EventMediator
  ) {
    super('TodayAndMorrowSchedulerJob');
    this.job.on('scheduled', (scheduleDate: Date) => {
      if (this.scheduleDate == undefined) {
        this.scheduleDate = scheduleDate;
        return;
      }
      console.log(`${this.job.name} onScheduled ${scheduleDate.toISOString()}`);
    });
  }

  static getInstance(
    todayAndMorrowService = TodayAndMorrowServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance()
  ) {
    return new TodayAndMorrowScheduler(todayAndMorrowService, eventMediator);
  }

  calculateNextInterval(apiMatches: ApiMatch[] = []): number {
    const liveMatches = apiMatches
      .filter(match => getMatchStatus(match.status) === MatchStatus.LIVE)
      .map(match => match.id);

    const finishedLiveMatches = this.liveMatches.filter(
      matchId => !liveMatches.some(id => id === matchId)
    );
    const startedLiveMatches = liveMatches.filter(
      matchId => !this.liveMatches.some(id => id === matchId)
    );
    const finishedOrStartedLiveMatches = [
      ...finishedLiveMatches,
      ...startedLiveMatches,
    ];

    if (liveMatches.length > 0 && this.liveMatches.length === 0) {
      this.liveMatches = liveMatches;
    } else if (liveMatches.length > 0 && this.liveMatches.length > 0) {
      if (finishedLiveMatches.length > 0) {
        this.finishedLiveMatches = finishedLiveMatches;
        this.liveMatchHasFinished = true;
      }
      if (finishedOrStartedLiveMatches.length > 0) {
        this.liveMatches = liveMatches;
      }
    } else if (liveMatches.length === 0 && this.liveMatches.length > 0) {
      this.finishedLiveMatches = this.liveMatches;
      this.liveMatches = [];
      this.liveMatchHasFinished = true;
    }

    const now = new Date();
    let nextPoll = addHours(now, 12); // dummy value
    if (liveMatches.length === 0) {
      for (const match of apiMatches) {
        const matchStatus = getMatchStatus(match.status);
        const matchStart = parseISO(match.utcDate);

        if (
          matchStatus === MatchStatus.SCHEDULED &&
          isBefore(matchStart, nextPoll) &&
          !isBefore(matchStart, now)
        ) {
          nextPoll = addMinutes(matchStart, 1);
        }
      }
    } else if (liveMatches.length > 0 || this.liveMatchHasFinished) {
      nextPoll = addMinutes(now, 1);
    }

    this.nextPoll = nextPoll;
    const nextIntervalInMs = Math.min(
      this.getDefaultIntervalMs(),
      differenceInMilliseconds(this.nextPoll, new Date())
    );
    const nextIntervalInUTC = new Date(
      Date.now() + nextIntervalInMs
    ).toUTCString();
    console.log(`${this.job.name} scheduled ${nextIntervalInUTC}`);

    return nextIntervalInMs;
  }

  async task() {
    let period = PERIOD.TODAY;

    const diffMs = differenceInMilliseconds(this.nextPoll, new Date());
    const diffHours = diffMs / (1000 * 60 * 60);
    const nextPollInHours = Math.round(diffHours);

    if (nextPollInHours >= 6) {
      period = PERIOD.TODAY_AND_MORROW;
    } else if (this.liveMatchHasFinished) {
      period = PERIOD.TODAY;
    } else if (this.liveMatches.length > 0) {
      period = PERIOD.LIVE;
    }

    const apiMatches = await this.todayAndMorrowService.syncMatches(period);
    if (this.liveMatches.length > 0 && this.liveMatchHasFinished) {
      console.log(
        `${this.job.name} publish footballApiLiveMatchUpdatesCompleted`
      );
      this.eventMediator.publish(
        'footballApiLiveMatchUpdatesCompleted',
        this.finishedLiveMatches
      );
    } else if (this.liveMatches.length === 0 && this.liveMatchHasFinished) {
      console.log(`${this.job.name} publish footballApiMatchUpdatesCompleted`);
      this.eventMediator.publish(
        'footballApiMatchUpdatesCompleted',
        this.finishedLiveMatches
      );
    }

    if (this.liveMatchHasFinished) {
      this.liveMatchHasFinished = false;
    }
    return apiMatches;
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
