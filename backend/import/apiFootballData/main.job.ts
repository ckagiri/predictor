import { Queue } from '../queue';
import { Job } from '../jobs/job';
import { CompetitionJob } from './competition.job';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../thirdParty/footballApi/apiClient';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../db/repositories/season.repo';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../db/repositories/team.repo';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../db/repositories/match.repo';

export class MainJob implements Job {
  public static getInstance() {
    return new MainJob(
      FootballApiClientImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      SeasonRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
      MatchRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }

  constructor(
    private apiClient: FootballApiClient,
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private matchRepo: MatchRepository,
  ) { }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
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
      .catch((err: any) => {
        const message = err.message || 'Something went wrong!';
        throw new Error(message);
      });
  }
}
