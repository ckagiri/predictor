import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import schedule, { Job } from "node-schedule";
import { lastValueFrom } from "rxjs";
import { FootballApiClient, FootballApiClientImpl } from "../../../thirdParty/footballApi/apiClient";
import { Scheduler, SchedulerOptions } from "../scheduler";
import { FootballApiProvider } from "../../../common/footballApiProvider";
import { get } from "lodash";
import { GameRoundRepository, GameRoundRepositoryImpl } from "../../../db/repositories/gameRound.repo";
import mongoose, { ConnectOptions } from "mongoose";

const DEFAULT_INTERVAL = 12 * 60 * 60 * 1000; // 12H

class SeasonNextRoundScheduler implements Scheduler {
  private job: Job = new schedule.Job('SeasonNextRound Job', this.jobTask.bind(this));
  private jobScheduled: boolean = false;
  private taskRunning: boolean = false;
  private interval: number = DEFAULT_INTERVAL;

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    footballApiClient = FootballApiClientImpl.getInstance(FootballApiProvider.API_FOOTBALL_DATA),
  ) {
    return new SeasonNextRoundScheduler(competitionRepo, seasonRepo, gameRoundRepo, footballApiClient);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private footballApiClient: FootballApiClient
  ) { }

  startJob({ interval = DEFAULT_INTERVAL, runImmediately }: SchedulerOptions): void {
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
    for (const competition of competitions) {
      const currentSeasonId = competition.currentSeason?.toString();
      if (!currentSeasonId) return;

      const currentSeason = await lastValueFrom(this.seasonRepo.findById$(currentSeasonId));
      const currentRoundId = currentSeason.currentGameRound?.toString();
      if (!currentRoundId) return;

      const currentRound = await lastValueFrom(this.gameRoundRepo.findById$(currentRoundId));
      const dbCurrentRoundPosition = currentRound.position;

      const externalId = get(competition, ['externalReference', FootballApiProvider.API_FOOTBALL_DATA, 'id']);
      if (!externalId) return;

      const apiCompetitionResponse = await this.footballApiClient.getCompetition(externalId)
      const { data: apiCompetition } = apiCompetitionResponse;
      const apiCurrentMatchday = get(apiCompetition, ['currentSeason', 'currentMatchday']);

      if (apiCurrentMatchday !== dbCurrentRoundPosition) {
        const nextGameRound = await lastValueFrom(this.gameRoundRepo.findOne$({ position: apiCurrentMatchday }));
        if (!nextGameRound) return;

        await lastValueFrom(this.seasonRepo.findByIdAndUpdate$(currentSeasonId, { currentGameRound: nextGameRound.id }));
      }
    }
  }

  cancelJob(): void {
    this.job.cancel();
    this.jobScheduled = false;
  }

  jobSuccess() {
    const nextUpdate = new Date(Date.now() + this.getInterval());
    this.job.schedule(nextUpdate)
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

  const scheduler = SeasonNextRoundScheduler.getInstance();
  scheduler.startJob({ interval: 10 * 1000, runImmediately: true });
})();
