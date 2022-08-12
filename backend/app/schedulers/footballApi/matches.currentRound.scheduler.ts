import mongoose, { ConnectOptions } from 'mongoose';

import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";

import { lastValueFrom } from "rxjs";
import { Scheduler, SchedulerOptions } from "../scheduler";
import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { Match } from "../../../db/models/match.model";
import { FootballApiProvider } from '../../../common/footballApiProvider';
import schedule, { Job } from "node-schedule";
import { makeMatchUpdate, matchChanged } from "./util";
import { get } from 'lodash';

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000; // 7H

class CurrentRoundMatchesScheduler implements Scheduler {
  private job: Job = new schedule.Job('CurrentRoundMatches Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA)
  ) {
    return new CurrentRoundMatchesScheduler(competitionRepo, seasonRepo, matchRepo, footballApiClient);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository,
    private footballApiClient: FootballApiClient,
  ) {
    this.job.on('success', result => {
      this.jobSuccess(result);
    });
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
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasons = competitions.map(c => c.currentSeason?.toString() || '');
    const seasons = await lastValueFrom(this.seasonRepo.findAllByIds$(currentSeasons));
    const result: [string, Match[]][] = await lastValueFrom(this.matchRepo.findAllForCurrentGameRounds$(seasons));
    for (const [_seasonId, dbMatches] of result) {
      const externalIds: string[] = dbMatches.map(dbMatch => {
        const externalId = get(dbMatch, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
        return externalId;
      }).filter(Boolean);
      const apiMatchesResponse = await this.footballApiClient.getMatches(externalIds);
      const apiMatches: any[] = apiMatchesResponse.data.matches;
      apiMatches.forEach(async apiMatch => {
        const dbMatch = dbMatches.find(match => {
          const externalId = get(match, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
          return apiMatch.id == externalId;
        });
        if (!dbMatch) return;
        if (matchChanged(apiMatch, dbMatch)) {
          const matchId = dbMatch?.id!;
          const update = makeMatchUpdate(apiMatch);
          await lastValueFrom(this.matchRepo.findByIdAndUpdate$(matchId, update));
        }
      });
    }
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

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  const scheduler = CurrentRoundMatchesScheduler.getInstance();
  scheduler.startJob({ interval: 10 * 1000, runImmediately: true });
})();
