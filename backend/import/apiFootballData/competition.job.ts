import { from } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { Job } from '../jobs/job';
import { Queue } from '../queue';
import { FootballApiClient } from '../../thirdParty/footballApi/apiClient';
import { SeasonRepository } from '../../db/repositories/season.repo';
import { TeamRepository } from '../../db/repositories/team.repo';
import { MatchRepository } from '../../db/repositories/match.repo';
import { MatchesJob } from './matches.job';
import { TeamsJob } from './teams.job';
import Builder from './competitionJob.builder';

export class CompetitionJob implements Job {
  private competitionId: number | string;
  private apiClient: FootballApiClient;
  private seasonRepo: SeasonRepository;
  private teamRepo: TeamRepository;
  private matchRepo: MatchRepository;

  constructor(builder: Builder) {
    this.apiClient = builder.ApiClient;
    this.seasonRepo = builder.SeasonRepo;
    this.teamRepo = builder.TeamRepo;
    this.matchRepo = builder.MatchRepo;
    this.competitionId = builder.CompetitionId;
  }

  static get Builder(): Builder {
    return new Builder();
  }

  public start(queue: Queue) {
    // tslint:disable-next-line: no-console
    console.log('** starting ApiFootballData Competition job');
    return from(this.apiClient.getCompetition(this.competitionId))
      .pipe(
        flatMap((response: any) => {
          const competition = response.data;
          delete competition.seasons;
          const { currentSeason } = competition;
          const season = { ...competition, id: currentSeason.id };
          return this.seasonRepo.findByExternalIdAndUpdate$(season);
        }),
        map(_ => {
          const matchesJob = MatchesJob.Builder.setApiClient(this.apiClient)
            .setMatchRepo(this.matchRepo)
            .withCompetition(this.competitionId)
            .build();

          const teamsJob = TeamsJob.Builder.setApiClient(this.apiClient)
            .setTeamRepo(this.teamRepo)
            .withCompetition(this.competitionId)
            .build();

          queue.addJob(matchesJob);
          queue.addJob(teamsJob);
        }),
      )
      .toPromise();
  }
}
