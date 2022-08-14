import mongoose, { ConnectOptions } from "mongoose";
import schedule, { Job } from "node-schedule";
import { Scheduler, SchedulerOptions } from "./scheduler";
import { lastValueFrom } from "rxjs";
import { CompetitionRepository, CompetitionRepositoryImpl } from "../../db/repositories/competition.repo";
import { SeasonRepository, SeasonRepositoryImpl } from "../../db/repositories/season.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../db/repositories/match.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../db/repositories/prediction.repo";
import { EventMediator, EventMediatorImpl } from "../../common/eventMediator";

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

export class MakePredictionsScheduler implements Scheduler {
  private job: Job = new schedule.Job('MakePredictions Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    eventMediator = EventMediatorImpl.getInstance(),
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance(),
  ) {
    return new MakePredictionsScheduler(eventMediator, competitionRepo, seasonRepo, matchRepo, predictionRepo);
  }

  constructor(
    private eventMediator: EventMediator,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) {
    this.job.on('success', () => {
      this.jobSuccess();
    });
    this.eventMediator.addListener(
      'currentSeasonCurrentRoundUpdated', async () => { await this.runJob() }
    );
  }

  startJob(options = { interval: DEFAULT_INTERVAL, runImmediately: false }): void {
    const { interval, runImmediately } = options;
    if (this.jobScheduled) throw new Error('Job already scheduled');
    this.setInterval(interval);
    if (runImmediately) {
      this.jobTask().then(() => {
        this.jobSuccess();
      });
    } else {
      return this.job.runOnDate(new Date(Date.now() + this.getInterval()));
    }
  }

  async jobTask() {
    if (this.taskRunning) return;
    this.taskRunning = true;

    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
    const currentSeasons = await lastValueFrom(this.seasonRepo.findAllByIds$(currentSeasonIds));
    const result = await lastValueFrom(this.matchRepo.findAllForCurrentGameRounds$(currentSeasons));

    for (const [seasonId, currentRoundMatches] of result) {
      const users = await lastValueFrom(this.predictionRepo.distinct$('user', { season: seasonId }));
      for (const userId of users) {
        await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, currentRoundMatches))
      }
    }
    this.taskRunning = false;
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess(_result?: any, reschedule: boolean = false) {
    const nextUpdate = new Date(Date.now() + this.getInterval());
    if (reschedule) {
      this.job.reschedule(nextUpdate.getTime());
    } else {
      this.job.schedule(nextUpdate)
    }
  }

  async runJob() {
    await this.jobTask();
    this.jobSuccess(undefined, true);
  }

  private getInterval() {
    return this.interval;
  }

  private setInterval(value: number) {
    this.interval = value;
  }
}

// (async () => {
//   await mongoose.connect(process.env.MONGO_URI!, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

//   const scheduler = MakePredictionsScheduler.getInstance();
//   scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
// })();
