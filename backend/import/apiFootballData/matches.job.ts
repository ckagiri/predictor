import { from, lastValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { MatchRepository } from '../../db/repositories/match.repo.js';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient.js';
import { Job } from '../jobs/job.js';
import { Queue } from '../queue.js';
import Builder from './matchesJob.builder.js';

export class MatchesJob implements Job {
  static get builder(): Builder {
    return new Builder();
  }
  private _apiClient: FootballApiClient;
  private _competitionId: number | string;

  private _matchRepo: MatchRepository;

  constructor(builder: Builder) {
    const { apiClient, competitionId, matchRepo } = builder;
    if (!competitionId || !apiClient || !matchRepo) {
      throw new Error('Matches Job not properly initialised');
    }
    this._competitionId = competitionId;
    this._apiClient = apiClient;
    this._matchRepo = matchRepo;
  }

  public start(queue: Queue) {
    console.log('** starting ApiFootballData Matches job');
    return lastValueFrom(
      from(this._apiClient.getCompetitionMatches(this._competitionId)).pipe(
        mergeMap((response: any) => {
          const matches: any[] = response.data.matches ?? [];
          return this._matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
        })
      )
    );
  }
}
