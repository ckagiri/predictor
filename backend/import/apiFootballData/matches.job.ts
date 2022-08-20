import { from, lastValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { MatchRepository } from '../../db/repositories/match.repo';
import Builder from './matchesJob.builder';

export class MatchesJob implements Job {
  private _competitionId: number | string;
  private _apiClient: FootballApiClient;
  private _matchRepo: MatchRepository;

  constructor(builder: Builder) {
    const { apiClient, matchRepo, competitionId } = builder;
    if (!competitionId || !apiClient || !matchRepo) {
      throw new Error('Matches Job not properly initialised');
    }
    this._competitionId = competitionId;
    this._apiClient = apiClient;
    this._matchRepo = matchRepo;
  }

  static get builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Matches job');
    return lastValueFrom(
      from(this._apiClient.getCompetitionMatches(this._competitionId))
        .pipe(
          mergeMap((response: any) => {
            let matches: any[] = response.data.matches || [];
            return this._matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
          }),
        )
    );
  }
}
