import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

import { SeasonRepository, SeasonRepositoryImpl } from '../../../db/repositories/season.repo';
import { GameRoundRepositoryImpl, GameRoundRepository } from '../../../db/repositories/gameRound.repo';
import { TeamRepository, TeamRepositoryImpl } from '../../../db/repositories/team.repo';

export class CompetitionSeasonsController {
  static getInstance(
    teamRepo = TeamRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
  ) {
    return new CompetitionSeasonsController(teamRepo, seasonRepo, gameRoundRepo);
  }

  constructor(
    private teamRepo: TeamRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository
  ) { }

  getSeason = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));

      if (!season) {
        throw new Error('season not found');
      }

      const teams = await lastValueFrom(this.teamRepo.findAllByIds$(season.teams as string[]));
      const rounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season.id }));

      res.status(200).json({
        season,
        teams,
        rounds,
        currentRound: season.currentGameRound?.toString(),
      })
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const competitionSeasonsController = CompetitionSeasonsController.getInstance();
export default competitionSeasonsController;
