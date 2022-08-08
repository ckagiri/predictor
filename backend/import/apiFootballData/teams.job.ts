import { from, lastValueFrom, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { TeamRepository } from '../../db/repositories/team.repo';
import Builder from './teamsJob.builder';
import { Team } from '../../db/models/team.model';

export class TeamsJob implements Job {
  private _competitionId: number | string;
  private _apiClient: FootballApiClient;
  private _teamRepo: TeamRepository;

  constructor(builder: Builder) {
    const { competitionId, apiClient, teamRepo } = builder;
    if (!competitionId || !apiClient || !teamRepo) {
      throw new Error('Teams Job not properly initialised');
    }
    this._competitionId = competitionId;
    this._apiClient = apiClient;
    this._teamRepo = teamRepo;
  }

  static get builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Teams job');
    return lastValueFrom(
      from(this._apiClient?.getTeams(this._competitionId))
        .pipe(
          mergeMap((teamsRes: any) => {
            const teams = teamsRes.data.teams;
            return this._teamRepo?.findEachByNameAndUpsert$(teams) as Observable<Team[]>;
          }),
        )
    );
  }
}
