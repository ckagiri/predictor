import { Request, Response } from 'express';
import { flatMap, map } from 'rxjs/operators';
import { Season } from '../../../db/models';
import { zip } from 'rxjs';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../db/repositories/season.repo';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../db/repositories/team.repo';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../db/repositories/match.repo';
import {
  CompetitionRepositoryImpl,
  CompetitionRepository,
} from '../../../db/repositories/competition.repo';

export class GameController {
  public static getInstance() {
    return new GameController(
      CompetitionRepositoryImpl.getInstance(),
      SeasonRepositoryImpl.getInstance(),
      TeamRepositoryImpl.getInstance(),
      MatchRepositoryImpl.getInstance(),
    );
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private matchRepo: MatchRepository,
  ) { }

  public getGameData = async (_req: Request, res: Response) => {
    try {
      const gameData = await this.competitionRepo
        .findAll$()
        .pipe(
          map(competitions => {
            // Todo: global-config
            const selectedCompetition = competitions.find(
              c => c.slug === 'english-premier-league',
            );
            return {
              competitions,
              selectedCompetition,
            };
          }),
        )
        .pipe(
          flatMap(({ competitions, selectedCompetition }) => {
            const competitionId = selectedCompetition?.id;
            return this.seasonRepo
              .findAll$({ 'competition.id': competitionId })
              .pipe(
                map(seasons => {
                  return {
                    competitions,
                    selectedCompetition,
                    competitionSeasons: seasons,
                  };
                }),
              );
          }),
        )
        .pipe(
          flatMap(
            ({ competitions, selectedCompetition, competitionSeasons }) => {
              // Todo: global-config
              const selectedSeason = competitionSeasons.find(
                s => s.year === 2022,
              );
              // Todo: season-teams
              return zip(
                this.teamRepo.getAllBySeason$(selectedSeason?.id!),
                this.matchRepo.findAll$({ season: selectedSeason?.id }),
                (teams, matches) => {
                  const seasonMatches = matches.map(m => {
                    const homeTeamId = m.homeTeam?.id.toString();
                    const awayTeamId = m.awayTeam?.id.toString();
                    const seasonId = m.season?.toString();
                    delete m.homeTeam;
                    delete m.awayTeam;
                    return {
                      ...m,
                      seasonId,
                      homeTeamId,
                      awayTeamId,
                    };
                  });
                  return {
                    seasonTeams: teams,
                    seasonMatches,
                  };
                },
              ).pipe(
                map(({ seasonTeams, seasonMatches }) => {
                  return {
                    competitions,
                    selectedCompetition,
                    competitionSeasons,
                    selectedSeason,
                    seasonTeams,
                    seasonMatches,
                  };
                }),
              );
            },
          ),
        )
        .pipe(
          map(
            ({
              competitions,
              selectedCompetition,
              competitionSeasons,
              selectedSeason,
              seasonTeams,
              seasonMatches,
            }) => {
              const competitionId = selectedCompetition?.id?.toString();
              function mapSeason(season: Season | undefined) {
                delete season?.competition;
                delete season?.teams;
                return { ...season, competitionId };
              }
              return {
                competitions: competitions,
                selectedCompetition,
                competitionSeasons: competitionSeasons.map(mapSeason),
                selectedSeason: {
                  record: mapSeason(selectedSeason),
                  teams: seasonTeams,
                  matches: seasonMatches,
                },
              };
            },
          ),
        )
        .toPromise();
      res.status(200).json(gameData);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const gameController = GameController.getInstance();

export default gameController;
