import { from, lastValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
    const { apiClient, matchRepo, competitionId } = builder;
    if (!apiClient || !matchRepo || !competitionId) {
      throw new Error('Matches Job not properly initialised');
    }
    this.apiClient = apiClient;
    this.matchRepo = matchRepo;
    this.competitionId = competitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Matches job');
    return lastValueFrom(
      from(this.apiClient?.getMatches(this.competitionId!))
        .pipe(
          mergeMap((response: any) => {
            let matches: any[] = response.data.matches || [];
            matches = matches.map(m => ({ ...m, gameRound: m.matchday }));
            return this.matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
          }),
        )
    );
  }
}
