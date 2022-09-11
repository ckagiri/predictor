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

    if (!this.nextPoll || this.nextPoll.diff(moment(), 'hours') === 12) {
      period = PERIOD.TODAY_AND_MORROW
    } else if (this.hasLiveMatch) {
      period = PERIOD.LIVE
    }

    const apiMatches = await this.todayAndMorrowService.syncMatches(period);
    return apiMatches;
  }

  calculateNextInterval(result: any = []): number {
    const apiMatches: any[] = result;
    const now = moment();

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
        if (matchStart.isBefore(nextPoll)) {
          nextPoll = matchStart;
        }
      }
    }
    if (this.hasLiveMatch) {
      this.nextPoll = moment().add(90, 'seconds');
    } else {
      // precautionary handle nextPoll being behind
      const diff = nextPoll.diff(now, 'minutes');
      this.nextPoll = diff < 0 ? moment().add(3, 'minutes') : nextPoll;
    }

    return Math.min(this.getDefaultIntervalMs(), this.nextPoll.diff(moment()))
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}
