import schedule, { Job } from 'node-schedule'
import { lastValueFrom } from 'rxjs';
import mongoose, { ConnectOptions } from 'mongoose';

import { CompetitionRepository, CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { PredictionProcessor, PredictionProcessorImpl } from './prediction.processor';
import { Scheduler, SchedulerOptions } from "./scheduler";
import { isEmpty } from 'lodash';

const DEFAULT_INTERVAL = 7 * 60 * 60 * 1000;

class CalculatePredictionsScheduler implements Scheduler {
  private job: Job = new schedule.Job('CalculatePredictions Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionProcessor = PredictionProcessorImpl.getInstance()) {
    return new CalculatePredictionsScheduler(competitionRepo, matchRepo, predictionProcessor);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private matchRepo: MatchRepository,
    private predictionProcessor: PredictionProcessor) {
    this.job.on('success', result => {
      this.jobSuccess(result);
    });
  }

  startJob({ interval = DEFAULT_INTERVAL, runImmediately }: SchedulerOptions) {
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
    const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
    const result = await lastValueFrom(
      this.matchRepo.findAllFinishedForCurrentSeasons$(currentSeasonIds, { allPredictionPointsCalculated: false })
    );
    for (const [seasonId, matches] of result) {
      if (isEmpty(matches)) continue;
      await this.predictionProcessor.calculatePredictionPoints(seasonId, matches)
      matches.forEach(match => {
        match.allPredictionPointsCalculated = true;
      });
      await lastValueFrom(this.matchRepo.updateMany$(matches));
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

  const scheduler = CalculatePredictionsScheduler.getInstance();
  scheduler.startJob({ interval: 5 * 1000, runImmediately: true });
})();
