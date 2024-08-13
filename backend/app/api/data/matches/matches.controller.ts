import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { isMongoId } from '../../utils';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../../db/repositories/season.repo';
import {
  MatchRepositoryImpl,
  MatchRepository,
} from '../../../../db/repositories/match.repo';
import {
  GameRoundRepositoryImpl,
  GameRoundRepository,
} from '../../../../db/repositories/gameRound.repo';
import { GameRound } from '../../../../db/models/gameRound.model';

export class MatchesController {
  public static getInstance(
    matchRepo = MatchRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
  ) {
    return new MatchesController(matchRepo, seasonRepo, gameRoundRepo);
  }

  constructor(
    private matchRepo: MatchRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
  ) { }

  public getMatches = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;

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

      let gameRound: GameRound | undefined;
      if (roundSlug) {
        gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
          season: season?.id, slug: roundSlug
        }));
      }
      type FindGameRoundQuery = { season: string, gameRound?: string };
      let query: FindGameRoundQuery = { season: season.id! };
      if (gameRound) {
        query = { ...query, gameRound: gameRound?.id }
      }

      const matches = await lastValueFrom(this.matchRepo.findAll$(query,
        '-createdAt -allPredictionPointsCalculated -externalReference')
      );
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getMatch = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.slug;

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
      }));
      if (!gameRound) {
        throw new Error('gameround not found');
      }

      const match = await lastValueFrom(this.matchRepo.findOne$({
        season: season?.id, slug: matchSlug
      }, '-createdAt -allPredictionPointsCalculated -externalReference'));
      if (match) {
        return res.status(200).json(match);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const matchesController = MatchesController.getInstance();

export default matchesController;
