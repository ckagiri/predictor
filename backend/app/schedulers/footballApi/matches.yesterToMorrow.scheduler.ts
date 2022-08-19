
import { getMatchStatus } from "./util";
import { MatchStatus } from "../../../db/models/match.model";
import moment from "moment";
import mongoose, { ConnectOptions } from "mongoose";
import { YesterToMorrowService, YesterToMorrowServiceImpl } from "./matches.yesterToMorrow.service";
import { BaseScheduler } from "../baseScheduler";

const DEFAULT_INTERVAL_MILLISECONDS = 12 * 60 * 60 * 1000; // 12H

class YesterToMorrowScheduler extends BaseScheduler {
  public static getInstance(
    yesterToMorrowService = YesterToMorrowServiceImpl.getInstance(),
  ) {
    return new YesterToMorrowScheduler(yesterToMorrowService);
  }

  constructor(
    private yesterToMorrowService: YesterToMorrowService,
  ) {
    super('YesterToMorrowScheduler Job');
    this.job.on('scheduled', () => {
      // todo
      // if diff(this.scheduleDate, now) < 120 && diff(scheduleDate, now) > 120
      // publish if lastUpdate was 2 mins ago and nextUpdate is 2+ mins later
    })
  }

  async task() {
    const includeYesterdayAndTomorrowMatches = this.getIntervalMs() > this.getDefaultIntervalMs();
    const apiMatches = await this.yesterToMorrowService.updateMatches(includeYesterdayAndTomorrowMatches);
    return apiMatches;
  }

  calculateNextInterval(result: any): number {
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

    return nextUpdate.diff(moment())
  }

  protected getDefaultIntervalMs(): number {
    return DEFAULT_INTERVAL_MILLISECONDS;
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = YesterToMorrowScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
