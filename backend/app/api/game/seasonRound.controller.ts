import { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { isNil, omit, omitBy } from 'lodash';
import { lastValueFrom } from 'rxjs';

import type { UserScore } from '../../../db/models/userScore.model.js';

import { Score } from '../../../common/score.js';
import { Prediction } from '../../../db/models/index.js';
import { BOARD_TYPE } from '../../../db/models/leaderboard.model.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../../db/repositories/gameRound.repo.js';
import {
  LeaderboardRepository,
  LeaderboardRepositoryImpl,
} from '../../../db/repositories/leaderboard.repo.js';
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
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../../db/repositories/user.repo.js';
import {
  UserScoreRepository,
  UserScoreRepositoryImpl,
} from '../../../db/repositories/userScore.repo.js';

class SeasonRoundController {
  constructor(
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private userRepo: UserRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository
  ) {}

  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    leaderboardRepo = LeaderboardRepositoryImpl.getInstance(),
    userScoreRepo = UserScoreRepositoryImpl.getInstance()
  ) {
    return new SeasonRoundController(
      seasonRepo,
      gameRoundRepo,
      matchRepo,
      predictionRepo,
      userRepo,
      leaderboardRepo,
      userScoreRepo
    );
  }

  autoPickPredictions = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
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
      const _picks = await lastValueFrom(
        this.predictionRepo.findOrCreatePicks$(userId, roundMatches)
      );
      const picks = (_picks ?? []).map(p =>
        omit(p, ['_id', 'createdAt', 'updatedAt'])
      );

      res.status(200).json(picks);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  getRound = async (req: JWTRequest, res: Response) => {
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
      if (!roundSlug) {
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
      const roundMatches = await lastValueFrom(
        this.matchRepo.findAll$({
          gameRound: round.id,
          season: season.id,
        })
      );

      let score: undefined | UserScore;
      let userId: string | undefined;
      const predictor = req.query.predictor;
      if (predictor) {
        const user = await lastValueFrom(
          this.userRepo.findOne$({ username: predictor })
        );
        userId = user?.id;
      } else {
        // TODO: prevent auth id from non-existent user though valid token
        userId = req.auth?.id;
        const user = userId
          ? await lastValueFrom(this.userRepo.findById$(userId))
          : null;
        userId = user?.id;
      }

      if (userId) {
        const predictions = await lastValueFrom(
          this.predictionRepo.findOrCreatePredictions$(userId, roundMatches)
        );
        roundMatches.forEach(m => {
          const _prediction = predictions.find(
            p => p.match.toString() === m.id
          );
          const prediction = omit(_prediction, [
            '_id',
            'createdAt',
            'updatedAt',
          ]) as Prediction;
          m.prediction = prediction ?? null;
        });

        const leaderboard = await lastValueFrom(
          this.leaderboardRepo.findOne$({
            boardType: BOARD_TYPE.GLOBAL_ROUND,
            gameRound: round.id,
            season: season.id,
          })
        );
        if (leaderboard) {
          const foundScore = await lastValueFrom(
            this.userScoreRepo.findOne$(
              { leaderboard: leaderboard.id, user: userId },
              '-createdAt -user -leaderboard -matches'
            )
          );
          score = foundScore ?? undefined;
        }
      }

      const getTime = (date?: Date | number | string): number =>
        date != null ? new Date(date).getTime() : 0;
      const matches = roundMatches
        .map(m =>
          omit(m, [
            '_id',
            'odds',
            'allPredictionPointsCalculated',
            'allGlobalLeaderboardScoresProcessed',
            'externalReference',
            'createdAt',
            'updatedAt',
          ])
        )
        .sort((a, b) => {
          return getTime(a.utcDate) - getTime(b.utcDate);
        });
      matches.forEach(m => {
        m.homeTeam = m.homeTeam.id;
        m.awayTeam = m.awayTeam.id;
      });

      let response = { matches, round: round.id, score } as Record<string, any>;
      response = omitBy(response, isNil);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  };

  myScore = async (req: JWTRequest, res: Response) => {
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
      if (!roundSlug) {
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

      const leaderboard = await lastValueFrom(
        this.leaderboardRepo.findOne$({
          boardType: BOARD_TYPE.GLOBAL_ROUND,
          gameRound: round.id,
          season: season.id,
        })
      );
      if (!leaderboard) {
        throw new Error('leaderboard not found');
      }

      const userId = req.auth?.id;
      let userScore: null | UserScore = null;
      if (userId) {
        userScore = await lastValueFrom(
          this.userScoreRepo.findOne$(
            { leaderboard: leaderboard.id, user: userId },
            '-createdAt -user -leaderboard -matches'
          )
        );
      }
      res.status(200).json(userScore);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  };

  pickJoker = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const userId = req.auth?.id;
      const matchSlug = req.body?.slug;

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

      const _jokerPredictions = await lastValueFrom(
        this.predictionRepo.pickJoker$(userId, match, roundMatches)
      );
      const jokerPredictions = _jokerPredictions.map(p =>
        omit(p, ['createdAt', 'updatedAt'])
      );

      res.status(200).json(jokerPredictions);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  };

  pickPredictionScores = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const userId = req.auth?.id;
      const pickSlip: Record<string, string> = req.body;
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

      const picks = [] as Prediction[];
      for (const [matchSlug, scoreString] of Object.entries(pickSlip)) {
        const match = roundMatches.find(m => m.slug === matchSlug);
        if (match == undefined) continue;
        const score = scoreString.split('-');
        const goalsHomeTeam = Number(score[0]);
        const goalsAwayTeam = Number(score[1]);
        const choice = { goalsAwayTeam, goalsHomeTeam } as Score;
        const _pick = await lastValueFrom(
          this.predictionRepo.pickScore$(userId, match, roundMatches, choice)
        );
        const pick = omit(_pick, ['_id', 'createdAt', 'updatedAt']);
        picks.push(pick as Prediction);
      }
      res.status(200).json(picks);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const seasonRoundController = SeasonRoundController.getInstance();
export default seasonRoundController;
