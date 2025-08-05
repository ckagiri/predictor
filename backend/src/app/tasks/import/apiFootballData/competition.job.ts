import { from, lastValueFrom, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Season } from '../../../../db/models/index.js';
import {
  MatchRepository,
  SeasonRepository,
  TeamRepository,
} from '../../../../db/repositories/index.js';
import { FootballApiClient } from '../../../../thirdParty/footballApi/apiClient.js';
import { Job } from '../jobs/job.js';
import { Queue } from '../queue.js';
import Builder from './competitionJob.builder.js';
import { MatchesJob } from './matches.job.js';
import { TeamsJob } from './teams.job.js';

export class CompetitionJob implements Job {
  static get builder(): Builder {
    return new Builder();
  }
  private _apiClient: FootballApiClient;
  private _competitionId: number | string;
  private _matchRepo: MatchRepository;
  private _seasonRepo: SeasonRepository;

  private _teamRepo: TeamRepository;

  constructor(builder: Builder) {
    const { apiClient, competitionId, matchRepo, seasonRepo, teamRepo } =
      builder;
    if (
      !competitionId ||
      !apiClient ||
      !teamRepo ||
      !seasonRepo ||
      !matchRepo
    ) {
      throw new Error('Matches Job not properly initialised');
    }
    this._competitionId = competitionId;
    this._apiClient = apiClient;
    this._seasonRepo = seasonRepo;
    this._teamRepo = teamRepo;
    this._matchRepo = matchRepo;
  }

  public start(queue: Queue) {
    console.log('** starting ApiFootballData Competition job');
    return lastValueFrom(
      from(this._apiClient.getCompetition(this._competitionId)).pipe(
        mergeMap((response: any) => {
          const competition = response.data;
          delete competition.seasons;
          const { currentSeason } = competition;
          const season = { ...competition, id: currentSeason.id };
          return this._seasonRepo.findByExternalIdAndUpdate$(
            season
          ) as unknown as Observable<Season[]>;
        }),
        map(() => {
          const matchesJob = MatchesJob.builder
            .withApiClient(this._apiClient)
            .withMatchRepo(this._matchRepo)
            .setCompetition(this._competitionId)
            .build();

          const teamsJob = TeamsJob.builder
            .withApiClient(this._apiClient)
            .withTeamRepo(this._teamRepo)
            .setCompetition(this._competitionId)
            .build();

          queue.addJob(teamsJob);
          queue.addJob(matchesJob);
        })
      )
    );
  }
}
