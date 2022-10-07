import { Response } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { lastValueFrom } from "rxjs";
import { omit } from 'lodash';

import { BOARD_TYPE } from '../../../db/models/leaderboard.model';
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { GameRoundRepository, GameRoundRepositoryImpl } from '../../../db/repositories/gameRound.repo';
import { LeaderboardRepository, LeaderboardRepositoryImpl } from '../../../db/repositories/leaderboard.repo';
import { UserScoreRepository, UserScoreRepositoryImpl } from "../../../db/repositories/userScore.repo";
import { UserScore } from '../../../db/models';

export class RoundLeaderboardController {
  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    leaderboardRepo = LeaderboardRepositoryImpl.getInstance(),
    userScoreRepo = UserScoreRepositoryImpl.getInstance()
  ) {
    return new RoundLeaderboardController(seasonRepo, gameRoundRepo, leaderboardRepo, userScoreRepo);
  }

  constructor(
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository
  ) { }

  getMyUserScore = async (req: JWTRequest, res: Response) => {
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

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season.id, slug: roundSlug
      }));
      if (!round) {
        throw new Error('round not found');
      }

      const leaderboard = await lastValueFrom(this.leaderboardRepo.findOne$({
        season: season.id, gameRound: round.id, boardType: BOARD_TYPE.GLOBAL_ROUND
      }));
      if (!leaderboard) {
        throw new Error('leaderboard not found');
      }

      const userId = req.auth?.id;
      let userScore: UserScore | undefined;
      if (userId) {
        const _userScore = await lastValueFrom(this.userScoreRepo.findOne$({ leaderboard: leaderboard.id, user: userId }))
        userScore = omit(_userScore, [
          '_id', 'id', 'createdAt', 'updatedAt', 'user', 'leaderboard', 'matches', 'predictions'
        ]) as UserScore;
      }
      res.status(200).json(userScore);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const roundLeaderboardController = RoundLeaderboardController.getInstance();
export default roundLeaderboardController;
