import { CompetitionRepository } from "../../../db/repositories/competition.repo";
import { SeasonRepository } from "../../../db/repositories/season.repo";

import { lastValueFrom } from "rxjs";
import { Scheduler, SchedulerOptions } from "../scheduler";
import { MatchRepository } from "../../../db/repositories/match.repo";
import { FootballApiClient } from "thirdParty/footballApi/apiClient";
import { Match } from "../../../db/models/match.model";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import schedule, { Job } from "node-schedule";
import { matchChanged } from "./util";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class YesterToMorrowScheduler implements Scheduler {
  private job: Job = new schedule.Job('Predictions Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
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
      // 7h
      const tommorowApiMatchesResponse = await this.footballApiClient.getTomorrowsMatches();
      const yesterdayApiMatchesResponse = await this.footballApiClient.getYesterdaysMatches();

      apiMatches = [].concat(
        ...([tommorowApiMatchesResponse.data.matches, yesterdayApiMatchesResponse.data.matches] as any[]),
      );
    }
    const todayApiMatchesResponse = await this.footballApiClient.getTodaysMatches();
    apiMatches = apiMatches.concat(todayApiMatchesResponse.data.matches);

    const externalReferenceId = `externalReference.${FootballApiProvider.API_FOOTBALL_DATA}.id`
    const externalIds: string[] = apiMatches.map(m => m.id)
    const dbMatches = await lastValueFrom(this.matchRepo.findByExternalIds$(externalIds));
    apiMatches.forEach(async apiMatch => {
      const dbMatch = dbMatches.find(m => m[externalReferenceId] == apiMatch.id);
      if (!dbMatch) return;
      if (matchChanged(apiMatch, dbMatch)) {
        const id = dbMatch?.id;
        const { result, status, odds } = apiMatch;
        const update: any = { result, status, odds };
        await lastValueFrom(this.matchRepo.findByIdAndUpdate$(id!, update));
      }
    });
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess(_: any, reschedule: boolean = false) {
    const nextUpdate = new Date(Date.now() + this.getInterval());
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
