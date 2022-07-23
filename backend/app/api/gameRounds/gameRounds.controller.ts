import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../db/repositories/season.repo';
import {
  GameRoundRepositoryImpl,
  GameRoundRepository,
} from '../../../db/repositories/gameRound.repo';
import { isMongoId } from '../utils';
import { GameRound } from '../../../db/models/gameRound.model';

export class GameRoundsController {
  public static getInstance(
    seasonRepo?: SeasonRepository, gameRoundRepo?: GameRoundRepository
  ) {
    return new GameRoundsController(
      seasonRepo ?? SeasonRepositoryImpl.getInstance(),
      gameRoundRepo ?? GameRoundRepositoryImpl.getInstance()
    );
  }

  constructor(private seasonRepo: SeasonRepository, private gameRoundRepo: GameRoundRepository) { }

  public getGameRounds = async (req: Request, res: Response) => {
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
        $and: [{ 'competition.slug': competitionSlug }, { slug: seasonSlug }],
      }));

      const gameRounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season?.id }));
      res.status(200).json(gameRounds);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getGameRound = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let gameRound: GameRound;
      if (isMongoId(id)) {
        gameRound = await lastValueFrom(this.gameRoundRepo.findById$(id));
      } else {
        const competitionSlug = req.params.competition;
        const seasonSlug = req.params.season;

        const season = await lastValueFrom(this.seasonRepo.findOne$({
          $and: [{ 'competition.slug': competitionSlug }, { slug: seasonSlug }],
        }));

        gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
          $or: [
            {
              $and: [{ season: season.id }, { slug: id }],
            },
            {
              $and: [{ season: season.id }, { position: parseInt(id, 10) || 0 }],
            },
          ],
        }));
      }
      res.status(200).json(gameRound);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const gameRoundsController = GameRoundsController.getInstance();

export default gameRoundsController;
