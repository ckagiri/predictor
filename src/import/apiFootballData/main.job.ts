import { Queue } from '../queue';
import { IJob } from '../jobs/job';
import { CompetitionJob } from './competition.job';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { FootballApiClient, IFootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { ISeasonRepository, SeasonRepository } from '../../db/repositories/season.repo';
import { ITeamRepository, TeamRepository } from '../../db/repositories/team.repo';
import { IFixtureRepository, FixtureRepository } from '../../db/repositories/fixture.repo';

export class MainJob implements IJob {
  static getInstance() {
    return new MainJob(
      FootballApiClient.getInstance(ApiProvider.API_FOOTBALL_DATA),
      SeasonRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
      TeamRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
      FixtureRepository.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }

  constructor(
    private apiClient: IFootballApiClient,
    private seasonRepo: ISeasonRepository,
    private teamRepo: ITeamRepository,
    private fixtureRepo: IFixtureRepository) {
  }

  start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Main job')
    return this.apiClient.getCompetitions(2017).then((response: any) => {
      const { data: competitions } = response;
      for (const comp of competitions) {
        if (comp.id !== 2021) {
          continue;
        }
        const competition = { id: comp.id, caption: comp.caption }
        const jobBuilder = CompetitionJob.Builder;
        const job = jobBuilder
          .setApiClient(this.apiClient)
          .setSeasonRepo(this.seasonRepo)
          .setTeamRepo(this.teamRepo)
          .setFixtureRepo(this.fixtureRepo)
          .withCompetition(comp.id)
          .build();
        queue.addJob(job);
      }
    }).catch((err: any) => {
      const message = err.message || 'Something went wrong!'
      throw new Error(message)
    });
  }
}