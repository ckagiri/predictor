import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { isMongoId } from '../../utils';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../db/repositories/season.repo';
import {
  GameRoundRepositoryImpl,
  GameRoundRepository,
} from '../../../../db/repositories/gameRound.repo';

export class RoundsController {
  public static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance()
  ) {
    return new RoundsController(seasonRepo, gameRoundRepo);
  }

  constructor(private seasonRepo: SeasonRepository, private gameRoundRepo: GameRoundRepository) { }

  public getRounds = async (req: Request, res: Response) => {
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

      const gameRounds = await lastValueFrom(this.gameRoundRepo.findAll$(
        { season: season.id }, '-createdAt'
      ));
      res.status(200).json(gameRounds);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  };

  public getRound = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.slug;

      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season?.id, slug: roundSlug
      }, '-createdAt'));

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

const roundsController = RoundsController.getInstance();

export default roundsController;
