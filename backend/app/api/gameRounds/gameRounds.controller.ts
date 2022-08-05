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
import { Season } from '../../../db/models/season.model';

export class GameRoundsController {
  public static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance()
  ) {
    return new GameRoundsController(seasonRepo, gameRoundRepo);
  }

  constructor(private seasonRepo: SeasonRepository, private gameRoundRepo: GameRoundRepository) { }

  public getGameRounds = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonYearOrSlug = req.params.season;

      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonYearOrSlug) {
        throw new Error('season year or slug is required');
      }

      const isSeasonYear = /^\d{4}$/.test(seasonYearOrSlug);
      let season: Season | undefined;
      if (isSeasonYear) {
        season = await lastValueFrom(this.seasonRepo.findOne$({
          'competition.slug': competitionSlug, year: seasonYearOrSlug
        }));
      } else {
        season = await lastValueFrom(this.seasonRepo.findOne$({
          'competition.slug': competitionSlug, slug: seasonYearOrSlug
        }));
      }

      if (!season) {
        throw new Error('season not found');
      }

      const gameRounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season?.id }));
      res.status(200).json(gameRounds);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getGameRound = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!isMongoId(id)) {
        throw new Error('wrond id format');
      }
      const gameRound = await lastValueFrom(this.gameRoundRepo.findById$(id));
      if (gameRound) {
        return res.status(200).json(gameRound);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const gameRoundsController = GameRoundsController.getInstance();

export default gameRoundsController;
