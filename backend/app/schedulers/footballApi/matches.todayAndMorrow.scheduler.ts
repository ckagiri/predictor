import moment from "moment";

import { MatchStatus, getMatchStatus } from "../../../db/models/match.model";
import { TodayAndMorrowService, TodayAndMorrowServiceImpl, PERIOD } from "./matches.todayAndMorrow.service";
import { BaseScheduler } from "../baseScheduler";
import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H

export class TodayAndMorrowScheduler extends BaseScheduler {
  private scheduleDate?: Date;
  private nextPoll?: moment.Moment; // ideally what is supposed to be the next poll
  private liveMatchId = undefined;
  private liveMatchHasFinished = false;

  public static getInstance(
    todayAndMorrowService = TodayAndMorrowServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new TodayAndMorrowScheduler(todayAndMorrowService, eventMediator);
  }

  constructor(
    private todayAndMorrowService: TodayAndMorrowService,
    private eventMediator: EventMediator,
  ) {
    super('TodayAndMorrowSchedulerJob');
    this.job.on('scheduled', (scheduleDate: any) => {
      if (this.scheduleDate == undefined) {
        this.scheduleDate = scheduleDate;
        return;
      }
      console.log(`${this.job.name} onScheduled ${moment(scheduleDate).format()}`);
    })
  }

  async task() {
    let period = PERIOD.TODAY;
    const nextPollInHours = this.nextPoll == undefined ? undefined :
      Math.round(moment.duration(this.nextPoll.diff(moment())).asHours())
    if (nextPollInHours == undefined || nextPollInHours === 6) {
      period = PERIOD.TODAY_AND_MORROW
    } else if (this.liveMatchHasFinished) {
      period = PERIOD.TODAY;
    } else if (this.liveMatchId) {
      period = PERIOD.LIVE;
    }

    const apiMatches = await this.todayAndMorrowService.syncMatches(period);
    if (this.liveMatchId && this.liveMatchHasFinished) {
      console.log(`${this.job.name} publish footballApiLiveMatchUpdatesCompleted`);
      this.eventMediator.publish('footballApiLiveMatchUpdatesCompleted');
    } else if (!this.liveMatchId && this.liveMatchHasFinished) {
      console.log(`${this.job.name} publish footballApiMatchUpdatesCompleted`);
      this.eventMediator.publish('footballApiMatchUpdatesCompleted');
    }

    if (this.liveMatchHasFinished) {
      this.liveMatchHasFinished = false;
    }
    return apiMatches;
  }

  calculateNextInterval(result: any = []): number {
    const apiMatches: any[] = result;
    let liveMatch: any = apiMatches.find((match: any) => match.id === this.liveMatchId);

    let nextPoll = moment().add(12, 'hours');
    if (!liveMatch) {
      for (const match of apiMatches) {
        const matchStatus = getMatchStatus(match.status);
        const matchStart = moment(match.utcDate);

        if (matchStatus === MatchStatus.LIVE) {
          if (!liveMatch) {
            liveMatch = match;
          } else if (matchStart.isBefore(moment(liveMatch.utcDate))) {
            liveMatch = match;
          }
        } else if (matchStatus === MatchStatus.SCHEDULED) {
          if (matchStart.isBefore(nextPoll)) {
            nextPoll = matchStart.add(1, 'minutes');
          }
        }
      }
    }

    const liveMatchId = liveMatch?.id;
    if (liveMatchId && !this.liveMatchId) {
      this.liveMatchId = liveMatchId;
    } else if (liveMatchId && this.liveMatchId) {
      if (this.liveMatchId !== liveMatchId) {
        this.liveMatchId = liveMatchId;
        this.liveMatchHasFinished = true;
      }
    } else if (!liveMatchId && this.liveMatchId) {
      this.liveMatchId = undefined;
      this.liveMatchHasFinished = true;
    }

    // precautionary handle nextPoll being behind
    const diff = nextPoll.diff(moment(), 'minutes');
    nextPoll = diff <= 0 ? moment().add(1, 'minutes') : nextPoll;

    if (this.liveMatchId || this.liveMatchHasFinished) {
      nextPoll = moment().add(1, 'minutes');
    }
    this.nextPoll = nextPoll;

    const nextIntervalInMs = Math.min(this.getDefaultIntervalMs(), this.nextPoll.diff(moment()));
    const nextIntervalInUTC = new Date(Date.now() + nextIntervalInMs).toUTCString();
    console.log(`${this.job.name} scheduled ${nextIntervalInUTC}`);

    return nextIntervalInMs;
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
