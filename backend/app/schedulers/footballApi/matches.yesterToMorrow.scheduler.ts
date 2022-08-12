
import { lastValueFrom } from "rxjs";
import { Scheduler, SchedulerOptions } from "../scheduler";
import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import schedule, { Job } from "node-schedule";
import { getMatchStatus, makeMatchUpdate, matchChanged } from "./util";
import { get, isEmpty } from "lodash";
import { MatchStatus } from "../../../db/models/match.model";
import moment from "moment";
import mongoose, { ConnectOptions } from "mongoose";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class YesterToMorrowScheduler implements Scheduler {
  private job: Job = new schedule.Job('YesterToMorrowScheduler Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    matchRepo = MatchRepositoryImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA),
  ) {
    return new YesterToMorrowScheduler(matchRepo, footballApiClient)
  }

  constructor(
    private matchRepo: MatchRepository,
    private footballApiClient: FootballApiClient,
  ) {
  }

  startJob({ interval = DEFAULT_INTERVAL, runImmediately = false }: SchedulerOptions): void {
    if (this.jobScheduled) throw new Error('Job already scheduled');
    this.setInterval(interval);
    if (runImmediately) {
      this.jobTask().then(result => {
        this.jobSuccess(result);
      });
    } else {
      return this.job.runOnDate(new Date(Date.now() + this.getInterval()));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;
    let apiMatches: any[] = [];
    if (this.interval > DEFAULT_INTERVAL) {
      const tommorowApiMatchesResponse = await this.footballApiClient.getTomorrowsMatches();
      const yesterdayApiMatchesResponse = await this.footballApiClient.getYesterdaysMatches();

      apiMatches = [].concat(
        ...([tommorowApiMatchesResponse.data.matches, yesterdayApiMatchesResponse.data.matches] as any[]),
      );
    }
    const todayApiMatchesResponse = await this.footballApiClient.getTodaysMatches();
    apiMatches = apiMatches.concat(todayApiMatchesResponse.data.matches);

    const externalIds: string[] = apiMatches.map(m => m.id)
    const dbMatches = await lastValueFrom(this.matchRepo.findByExternalIds$(externalIds));
    apiMatches.forEach(async apiMatch => {
      const dbMatch = dbMatches.find(match => {
        const externalId = get(match, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
        return apiMatch.id === externalId;
      });
      if (!dbMatch) return;
      if (matchChanged(apiMatch, dbMatch)) {
        const matchId = dbMatch?.id!;
        const update = makeMatchUpdate(apiMatch);
        await lastValueFrom(this.matchRepo.findByIdAndUpdate$(matchId, update));
      }
    });
    this.taskRunning = false;
    return apiMatches;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess(result: any = [], reschedule: boolean = false) {
    const apiMatches = result as any[];
    const nextInterval = calculateNextInterval(this.interval, apiMatches)
    const nextUpdate = new Date(Date.now() + nextInterval);

    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async runJob() {
    const result = await this.jobTask();
    this.jobSuccess(result, true);
  }

  private getInterval() {
    return this.interval;
  }

  private setInterval(value: number) {
    this.interval = value;
  }
}

export function calculateNextInterval(defaultInterval: number, apiMatches: any[]): number {
  if (isEmpty(apiMatches)) { return defaultInterval }
  const now = moment();
  let nextUpdate = moment().add(12, 'hours');
  const matchStart1 = moment(apiMatches[0].utcDate);
  const finishedMatches = apiMatches.filter(f => getMatchStatus(f.status) === MatchStatus.FINISHED);
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


(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = YesterToMorrowScheduler.getInstance();
  scheduler.startJob({ interval: DEFAULT_INTERVAL + 1, runImmediately: true });
})();
