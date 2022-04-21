import { from, lastValueFrom, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { SeasonRepository } from '../../db/repositories/season.repo';
import { TeamRepository } from '../../db/repositories/team.repo';
import { MatchRepository } from '../../db/repositories/match.repo';
import { MatchesJob } from './matches.job';
import { TeamsJob } from './teams.job';
import Builder from './competitionJob.builder';
import { Season } from '../../db/models/season.model';

export class CompetitionJob implements Job {
  private _competitionId?: number | string;
  private _apiClient?: FootballApiClient;
  private _seasonRepo?: SeasonRepository;
  private _teamRepo?: TeamRepository;
  private _matchRepo?: MatchRepository;

  constructor(builder: Builder) {
    this._apiClient = builder.apiClient;
    this._seasonRepo = builder.seasonRepo;
    this._teamRepo = builder.teamRepo;
    this._matchRepo = builder.matchRepo;
    this._competitionId = builder.competitionId;
  }

  static get builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Competition job');
    return lastValueFrom(
      from(this._apiClient?.getCompetition(this._competitionId))
        .pipe(
          mergeMap((response: any) => {
            const competition = response.data;
            delete competition.seasons;
            const { currentSeason } = competition;
            const season = { ...competition, id: currentSeason.id };
            return this._seasonRepo?.findByExternalIdAndUpdate$(season) as Observable<Season[]>;
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

            queue.addJob(matchesJob);
            // queue.addJob(teamsJob);
          }),
        )
    );
  }
}
