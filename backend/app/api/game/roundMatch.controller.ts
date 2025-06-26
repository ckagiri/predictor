import { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { omit } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { Score } from '../../../common/score.js';
import { Prediction } from '../../../db/models/index.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../../db/repositories/gameRound.repo.js';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../db/repositories/match.repo.js';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../../db/repositories/prediction.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../db/repositories/season.repo.js';

export class RoundMatchController {
  constructor(
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) {}

  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new RoundMatchController(
      seasonRepo,
      gameRoundRepo,
      matchRepo,
      predictionRepo
    );
  }

  getMatch = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }
      if (!matchSlug) {
        throw new Error('round slug is required');
      }

      const season = await lastValueFrom(
        this.seasonRepo.findOne$({
          'competition.slug': competitionSlug,
          slug: seasonSlug,
        })
      );
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(
        this.gameRoundRepo.findOne$({
          season: season.id,
          slug: roundSlug,
        })
      );
      if (!round) {
        throw new Error('round not found');
      }

      const match = await lastValueFrom(
        this.matchRepo.findOne$(
          {
            season: season.id,
            slug: matchSlug,
          },
          '-createdAt'
        )
      );

      const userId = req.auth?.id;
      if (userId) {
        const prediction = await lastValueFrom(
          this.predictionRepo.findOneByUserAndMatch$(
            userId,
            match?.id!,
            '-createdAt'
          )
        );
        if (match) {
          match.prediction = prediction ?? null;
        }
      }

      res.status(200).json(match);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public pickJoker = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
      const userId = req.auth?.id;
      if (!userId) {
        throw new Error('user id is required');
      }
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }
      if (!matchSlug) {
        throw new Error('match slug is required');
      }

      const season = await lastValueFrom(
        this.seasonRepo.findOne$({
          'competition.slug': competitionSlug,
          slug: seasonSlug,
        })
      );
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(
        this.gameRoundRepo.findOne$({
          season: season.id,
          slug: roundSlug,
        })
      );
      if (!round) {
        throw new Error('round not found');
      }

      const roundMatches = await lastValueFrom(
        this.matchRepo.findAll$({
          gameRound: round.id,
          season: season.id,
        })
      );
      const match = roundMatches.find(m => m.slug === matchSlug);
      if (!match) {
        throw Error('match not found');
      }

      const jokerPredictions = await lastValueFrom(
        this.predictionRepo.pickJoker$(userId, match, roundMatches)
      );
      res.status(200).json(jokerPredictions);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public pickPredictionScore = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
      const userId = req.auth?.id;
      const choice: Score = req.body;
      if (!userId) {
        throw new Error('user id is required');
      }
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }
      if (!matchSlug) {
        throw new Error('match slug is required');
      }

      const season = await lastValueFrom(
        this.seasonRepo.findOne$({
          'competition.slug': competitionSlug,
          slug: seasonSlug,
        })
      );
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(
        this.gameRoundRepo.findOne$({
          season: season.id,
          slug: roundSlug,
        })
      );
      if (!round) {
        throw new Error('round not found');
      }

      const roundMatches = await lastValueFrom(
        this.matchRepo.findAll$({
          gameRound: round.id,
          season: season.id,
        })
      );
      const match = roundMatches.find(m => m.slug === matchSlug);
      if (!match) {
        throw Error('match not found');
      }

      const pick = await lastValueFrom(
        this.predictionRepo.pickScore$(userId, match, roundMatches, choice)
      );

      res.status(200).json(pick);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const roundMatchController = RoundMatchController.getInstance();
export default roundMatchController;
