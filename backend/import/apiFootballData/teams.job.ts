import { from, lastValueFrom, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { TeamRepository } from '../../db/repositories/team.repo';
import Builder from './teamsJob.builder';
import { Team } from '../../db/models/team.model';

export class TeamsJob implements Job {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _teamRepo?: TeamRepository;

  constructor(builder: Builder) {
    this._apiClient = builder.apiClient;
    this._teamRepo = builder.teamRepo;
    this._competitionId = builder.competitionId;
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
