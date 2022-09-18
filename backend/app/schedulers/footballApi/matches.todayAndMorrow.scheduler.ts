import moment from "moment";

import { getMatchStatus } from "./util";
import { MatchStatus } from "../../../db/models/match.model";
import { TodayAndMorrowService, TodayAndMorrowServiceImpl, PERIOD } from "./matches.todayAndMorrow.service";
import { BaseScheduler } from "../baseScheduler";
import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";

const DEFAULT_INTERVAL_MILLISECONDS = 6 * 60 * 60 * 1000; // 6H

export class TodayAndMorrowScheduler extends BaseScheduler {
  private scheduleDate?: Date;
  private nextPoll?: moment.Moment; // ideally what is supposed to be the next poll
  private hasLiveMatch = false;

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
      const scheduleDateDiffInSeconds = Math.abs(moment.duration(moment(scheduleDate).diff(this.scheduleDate)).asSeconds())
      if (scheduleDateDiffInSeconds > 300) {
        console.log(`${this.job.name} publish footballApiMatchUpdatesCompleted`);
        this.eventMediator.publish('footballApiMatchUpdatesCompleted');
      }
      this.scheduleDate = scheduleDate;
    })
  }

  async task() {
    let period = PERIOD.TODAY;
    const nextPollInHours = this.nextPoll == undefined ? undefined :
      Math.round(moment.duration(this.nextPoll.diff(moment())).asHours())
    if (nextPollInHours == undefined || nextPollInHours === 12) {
      period = PERIOD.TODAY_AND_MORROW
    } else if (this.hasLiveMatch) {
      period = PERIOD.LIVE
    }

    const apiMatches = await this.todayAndMorrowService.syncMatches(period);
    return apiMatches;
  }

  calculateNextInterval(result: any = []): number {
    const apiMatches: any[] = result;

    let hasLiveMatch = false;
    let nextPoll = moment().add(12, 'hours');
    for (const match of apiMatches) {
      const matchStatus = getMatchStatus(match.status)
      if (matchStatus === MatchStatus.LIVE) {
        hasLiveMatch = true;
        break;
      }
      if (matchStatus === MatchStatus.SCHEDULED) {
        const matchStart = moment(match.utcDate);
        if (matchStart.isBefore(nextPoll)) {
          nextPoll = matchStart.add(1, 'minutes');
        }
      }
    }

    if (this.hasLiveMatch && !hasLiveMatch) {
      this.hasLiveMatch = false;
      this.nextPoll = moment().add(3, 'minutes');
    } else if (hasLiveMatch) {
      this.hasLiveMatch = true;
      this.nextPoll = moment().add(90, 'seconds');
    } else {
      // precautionary handle nextPoll being behind
      const diff = nextPoll.diff(moment(), 'minutes');
      this.nextPoll = diff <= 0 ? moment().add(3, 'minutes') : nextPoll;
    }

    const nextIntervalInMs = Math.min(this.getDefaultIntervalMs(), this.nextPoll.diff(moment()));
    const nextIntervalInUTC = new Date(Date.now() + nextIntervalInMs).toUTCString();
    console.log(`${this.job.name} scheduled ${nextIntervalInUTC}`);

    return nextIntervalInMs;
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
