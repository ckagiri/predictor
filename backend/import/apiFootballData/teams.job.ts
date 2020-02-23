import { from } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { TeamRepository } from '../../db/repositories/team.repo';
import Builder from './teamsJob.builder';

export class TeamsJob implements Job {
  private competitionId: number | string;
  private apiClient: FootballApiClient;
  private teamRepo: TeamRepository;

  constructor(builder: Builder) {
    this.apiClient = builder.ApiClient;
    this.teamRepo = builder.TeamRepo;
    this.competitionId = builder.CompetitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Teams job');
    return from(this.apiClient.getTeams(this.competitionId))
      .pipe(
        flatMap((teamsRes: any) => {
          const teams = teamsRes.data.teams;
          return this.teamRepo.findEachByNameAndUpsert$(teams);
        }),
      )
      .toPromise();
  }
}
