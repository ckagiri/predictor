import { CompetitionRepository, CompetitionRepositoryImpl } from "../../db/repositories/competition.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../db/repositories/match.repo";
import mongoose, { ConnectOptions } from "mongoose";
import schedule, { Job } from "node-schedule";
import { lastValueFrom } from "rxjs";
import { LeaderboardProcessor, LeaderboardProcessorImpl } from "./leaderboard.processor";
import { Scheduler, SchedulerOptions } from "./scheduler";
import { isEmpty } from "lodash";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class LeaderboardScheduler implements Scheduler {
  private job: Job = new schedule.Job('Predictions Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    leaderboardProcessor = LeaderboardProcessorImpl.getInstance()
  ) {
    return new LeaderboardScheduler(competitionRepo, matchRepo, leaderboardProcessor)
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private matchRepo: MatchRepository,
    private leaderboardProcessor: LeaderboardProcessor) {
  }

  startJob({ interval = DEFAULT_INTERVAL, runImmediately }: SchedulerOptions): void {
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
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
    const result = await lastValueFrom(
      this.matchRepo.findAllFinishedForCurrentSeasons$(currentSeasonIds, {
        allPredictionPointsCalculated: true
      })
    );
    for (const [seasonId, matches] of result) {
      if (isEmpty(matches)) continue;
      await this.leaderboardProcessor.updateScores(seasonId, matches)
      await this.leaderboardProcessor.updateRankings(seasonId, matches)
      matches.forEach(match => {
        match.allGlobalLeaderboardScoresProcessed = true;
      });
      await lastValueFrom(this.matchRepo.updateMany$(matches));
    }
  }

  cancelJob(): void {
    throw new Error("Method not implemented.");
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

  const scheduler = LeaderboardScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
