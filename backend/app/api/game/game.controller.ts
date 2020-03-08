import { Request, Response } from 'express';
import { CompetitionRepository } from '../../../db/repositories/competition.repo';
import { flatMap, map } from 'rxjs/operators';
import { Competition } from 'db/models';
import { zip, from } from 'rxjs';
import { SeasonRepository } from 'db/repositories/season.repo';
import { TeamRepository } from 'db/repositories/team.repo';
import { MatchRepository } from 'db/repositories/match.repo';

export class GameController {
  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private matchRepo: MatchRepository,
  ) { }

  getGameData = async (_req: Request, res: Response) => {
    try {
      const gameData = await this.competitionRepo.findAll$()
        .pipe(
          map(competitions => {
            //Todo: global-config
            const selectedCompetition = competitions.find(c => c.slug === 'english-premier-league');
            return {
              competitions, selectedCompetition
            }
          })
        )
        .pipe(
          flatMap(({ competitions, selectedCompetition }) => {
            const competitionId = selectedCompetition?.id;
            return this.seasonRepo.findAll$({ 'competition.id': competitionId })
              .pipe(
                map(seasons => {
                  return {
                    competitions, selectedCompetition, competitionSeasons: seasons
                  }
                })
              )
          })
        )
        .pipe(
          flatMap(({ competitions, selectedCompetition, competitionSeasons }) => {
            //Todo: global-config
            const selectedSeason = competitionSeasons.find(s => s.year === 2019);
            // Todo: season-teams
            return zip(
              this.teamRepo.findAll$(),
              this.matchRepo.findAll$({ season: selectedSeason?.id }),
              (teams, matches) => {
                return {
                  seasonTeams: teams, seasonMatches: matches
                }
              })
              .pipe(
                map(({ seasonTeams, seasonMatches, }) => {
                  return {
                    competitions,
                    selectedCompetition,
                    competitionSeasons,
                    selectedSeason,
                    seasonTeams,
                    seasonMatches
                  }
                })
              )
          })
        )
        .pipe(
          map(({
            competitions, selectedCompetition, competitionSeasons,
            selectedSeason, seasonTeams, seasonMatches
          }) => {
            return {
              competitions,
              selectedCompetition,
              competitionSeasons,
              selectedSeason: {
                record: selectedSeason,
                teams: seasonTeams,
                matches: seasonMatches,
              },
            }
          }
          ))
        .toPromise();
      res.status(200).json(gameData)
    } catch (error) {
      res.status(500).send(error);
    }
  }
}
