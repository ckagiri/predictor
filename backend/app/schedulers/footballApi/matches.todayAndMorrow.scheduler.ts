import moment from "moment";
import { isEmpty } from "lodash";

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
    super('TodayAndMorrowScheduler Job');
    this.job.on('scheduled', (scheduleDate: any) => {
      if (this.scheduleDate == undefined) {
        this.scheduleDate = scheduleDate;
        return;
      }
      const now = moment();
      const durationFromlastScheduleInSecs = moment.duration(Math.abs(moment(this.scheduleDate).diff(now))).asSeconds();
      const durationToNextScheduleInSecs = moment.duration(Math.abs(moment(scheduleDate).diff(now))).asSeconds();
      if (durationFromlastScheduleInSecs < 120 && durationToNextScheduleInSecs > 120) {
        this.eventMediator.publish('footballApiMatchUpdatesCompleted');
      }
      this.scheduleDate = scheduleDate;
    })
  }

  async task() {
    let period = PERIOD.TODAY;
    const now = moment();
    if (!this.nextPoll) {
      period = PERIOD.TODAY_AND_MORROW
    } else if (this.nextPoll.diff(now, 'hours') === 12) {
      period = PERIOD.TODAY_AND_MORROW
    } else if (this.nextPoll.diff(now, 'minutes') <= 5) {
      period = PERIOD.LIVE
    }

    const apiMatches = await this.todayAndMorrowService.syncMatches(period);
    return apiMatches;
  }

  calculateNextInterval(result: any = []): number {
    const apiMatches: any[] = result;
    const now = moment();

    // precautionary if syncLive returned an empty set
    if (isEmpty(apiMatches) && this.hasLiveMatch) {
      this.nextPoll = now.add(10, 'minutes');
      return this.nextPoll.diff(now);
    }

    this.hasLiveMatch = false;
    let nextPoll = now.add(12, 'hours');
    for (const match of apiMatches) {
      const matchStatus = getMatchStatus(match.status)
      if (matchStatus === MatchStatus.LIVE) {
        this.hasLiveMatch = true;
        break;
      }
      if (matchStatus === MatchStatus.SCHEDULED) {
        const matchStart = moment(match.utcDate);
        const diff = matchStart.diff(now, 'minutes');
        if (diff <= 5) {
          this.hasLiveMatch = true;
          break;
        } else if (matchStart.isBefore(nextPoll)) {
          nextPoll = matchStart;
        }
      }
    }
    if (this.hasLiveMatch) {
      this.nextPoll = moment().add(90, 'seconds');
    } else {
      this.nextPoll = nextPoll;
    }

    return Math.min(this.getDefaultIntervalMs(), this.nextPoll.diff(moment()))
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
