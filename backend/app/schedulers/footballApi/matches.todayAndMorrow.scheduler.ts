
import { getMatchStatus } from "./util";
import { MatchStatus } from "../../../db/models/match.model";
import moment from "moment";
import mongoose, { ConnectOptions } from "mongoose";
import { TodayAndMorrowService, TodayAndMorrowServiceImpl } from "./matches.todayAndMorrow.service";
import { BaseScheduler } from "../baseScheduler";
import { EventMediator, EventMediatorImpl } from "../../../common/eventMediator";

const DEFAULT_INTERVAL_MILLISECONDS = 12 * 60 * 60 * 1000; // 12H

export class TodayAndMorrowScheduler extends BaseScheduler {
  private _scheduleDate: Date = new Date();

  public static getInstance(
    yesterToMorrowService = TodayAndMorrowServiceImpl.getInstance(),
    eventMediator = EventMediatorImpl.getInstance(),
  ) {
    return new TodayAndMorrowScheduler(yesterToMorrowService, eventMediator);
  }

  constructor(
    private yesterToMorrowService: TodayAndMorrowService,
    private eventMediator: EventMediator,
  ) {
    super('TodayAndMorrowScheduler Job');
    this.job.on('scheduled', (scheduleDate: any) => {
      const now = moment();
      const durationFromlastScheduleInSecs = moment.duration(moment(this.scheduleDate).diff(now)).asSeconds();
      const durationToNextScheduleInSecs = moment.duration(moment(scheduleDate).diff(now)).asSeconds();
      if (durationFromlastScheduleInSecs < 120 && durationToNextScheduleInSecs > 120) {
        this.eventMediator.publish('matchesThroughExternalApiUpdated');
      }
      this.scheduleDate = scheduleDate;
    })
  }

  async task() {
    const includeTomorrowsMatches = this.getIntervalMs() > this.getDefaultIntervalMs();
    const apiMatches = await this.yesterToMorrowService.updateMatches(includeTomorrowsMatches);
    return apiMatches;
  }

  calculateNextInterval(result: any = []): number {
    const apiMatches: any[] = result;
    const now = moment();
    let nextUpdate = moment().add(12, 'hours');
    const finishedMatches = apiMatches.filter(m => getMatchStatus(m.status) === MatchStatus.FINISHED);
    let hasLiveMatch = false;
    for (const match of finishedMatches) {
      const matchStatus = getMatchStatus(match.status)
      if (matchStatus === MatchStatus.LIVE) {
        hasLiveMatch = true;
        break;
      }
      if (matchStatus === MatchStatus.SCHEDULED) {
        const matchStart = moment(match.utcDate);
        const diff = matchStart.diff(now, 'minutes');
        if (diff <= 5) {
          hasLiveMatch = true;
          break;
        }
        if (matchStart.isAfter(now) && matchStart.isBefore(nextUpdate)) {
          nextUpdate = matchStart;
        }
      }
    }

    if (hasLiveMatch) {
      nextUpdate = moment().add(90, 'seconds');
    }

    return Math.min(this.getDefaultIntervalMs(), nextUpdate.diff(moment()))
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }

  private get scheduleDate(): Date {
    return this._scheduleDate;
  }

  private set scheduleDate(value: Date) {
    this._scheduleDate = value;
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = TodayAndMorrowScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
