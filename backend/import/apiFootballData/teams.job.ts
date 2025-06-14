import { from, lastValueFrom, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Team } from '../../db/models/team.model.js';
import { TeamRepository } from '../../db/repositories/team.repo.js';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient.js';
import { Job } from '../jobs/job.js';
import { Queue } from '../queue.js';
import Builder from './teamsJob.builder.js';

export class TeamsJob implements Job {
  static get builder(): Builder {
    return new Builder();
  }
  private _apiClient: FootballApiClient;
  private _competitionId: number | string;

  private _teamRepo: TeamRepository;

  constructor(builder: Builder) {
    const { apiClient, competitionId, teamRepo } = builder;
    if (!competitionId || !apiClient || !teamRepo) {
      throw new Error('Teams Job not properly initialised');
    }
    this._competitionId = competitionId;
    this._apiClient = apiClient;
    this._teamRepo = teamRepo;
  }

  public start(queue: Queue) {
    console.log('** starting ApiFootballData Teams job');
    return lastValueFrom(
      from(this._apiClient.getTeams(this._competitionId)).pipe(
        mergeMap((teamsRes: any) => {
          const teams = teamsRes.data.teams;
          return this._teamRepo.findEachByNameAndUpsert$(teams);
        })
      )
    );
  }
}
