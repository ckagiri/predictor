import { from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { MatchRepository } from '../../db/repositories/match.repo';
import Builder from './matchesJob.builder';

export class MatchesJob implements Job {
  private competitionId: number | string;
  private apiClient: FootballApiClient;
  private matchRepo: MatchRepository;

  constructor(builder: Builder) {
    this.apiClient = builder.ApiClient;
    this.matchRepo = builder.MatchRepo;
    this.competitionId = builder.CompetitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Matches job');
    return from(this.apiClient.getMatches(this.competitionId))
      .pipe(
        flatMap((response: any) => {
          const matches = response.data.matches;
          return this.matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
        }),
      )
      .toPromise();
  }
}
