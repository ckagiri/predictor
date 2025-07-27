import { FootballApiProvider as ApiProvider } from '../../../../common/footballApiProvider.js';
import {
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../db/repositories/index.js';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../../../thirdParty/footballApi/apiClient.js';
import { Job } from '../jobs/job.js';
import { Queue } from '../queue.js';
import { CompetitionJob } from './competition.job.js';

export class MainJob implements Job {
  constructor(
    private apiClient: FootballApiClient,
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private matchRepo: MatchRepository
  ) {}

  public static getInstance() {
    return new MainJob(
      FootballApiClientImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      SeasonRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      MatchRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA)
    );
  }

  public start(queue: Queue) {
    console.log('** starting ApiFootballData Main job');
    return this.apiClient
      .getCompetitions(2021)
      .then((response: any) => {
        const competitions = response.data.competitions;
        for (const comp of competitions) {
          if (comp.id !== 2021) {
            continue;
          }
          const job = CompetitionJob.builder
            .withApiClient(this.apiClient)
            .withSeasonRepo(this.seasonRepo)
            .withTeamRepo(this.teamRepo)
            .withMatchRepo(this.matchRepo)
            .setCompetition(comp.id)
            .build();
          queue.addJob(job);
        }
      })
      .catch((err: unknown) => {
        const message = (err as any).message ?? 'Something went wrong!';
        throw new Error(message);
      });
  }
}
