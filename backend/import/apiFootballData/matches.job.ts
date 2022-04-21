import { from, lastValueFrom, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { MatchRepository } from '../../db/repositories/match.repo';
import Builder from './matchesJob.builder';
import { Match } from '../../db/models/match.model';

export class MatchesJob implements Job {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _matchRepo?: MatchRepository;

  constructor(builder: Builder) {
    const { apiClient, matchRepo, competitionId } = builder;
    if (!apiClient || !matchRepo || !competitionId) {
      throw new Error('Matches Job not properly initialised');
    }
    this._apiClient = apiClient;
    this._matchRepo = matchRepo;
    this._competitionId = competitionId;
  }

  static get builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Matches job');
    return lastValueFrom(
      from(this._apiClient?.getMatches(this._competitionId))
        .pipe(
          mergeMap((response: any) => {
            let matches: any[] = response.data.matches || [];
            matches = matches.map(m => ({ ...m, gameRound: m.matchday }));
            return this._matchRepo?.findEachBySeasonAndTeamsAndUpsert$(matches) as Observable<Match[]>;
          }),
        )
    );
  }
}
