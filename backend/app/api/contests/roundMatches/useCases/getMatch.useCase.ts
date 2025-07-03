import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../../db/models/match.model.js';
import { CompetitionRepositoryImpl } from '../../../../../db/repositories/competition.repo.js';
import { GameRoundRepositoryImpl } from '../../../../../db/repositories/gameRound.repo.js';
import { MatchRepositoryImpl } from '../../../../../db/repositories/match.repo.js';
import { PredictionRepositoryImpl } from '../../../../../db/repositories/prediction.repo.js';
import { SeasonRepositoryImpl } from '../../../../../db/repositories/season.repo.js';
import { UserRepositoryImpl } from '../../../../../db/repositories/user.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import GetRoundMatchesUseCase from './getRoundMatches.useCase.js';

export interface RequestModel {
  competition: string;
  loggedInUserId?: string;
  match: string;
  season: string;
}

export default class GetMatchUseCase extends GetRoundMatchesUseCase {
  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new GetMatchUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo,
      userRepo,
      predictionRepo
    );
  }

  async execute({
    competition,
    loggedInUserId,
    match,
    season,
  }: RequestModel): Promise<void> {
    try {
      const foundCompetition = await this.findCompetition(competition);
      const foundSeason = await this.findSeason(foundCompetition, season);
      const foundMatch = await this.findMatch(foundSeason, match);
      const matchWithPrediction = await this.getMatchWithPrediction(
        foundMatch,
        loggedInUserId
      );
      this.responder.respond(matchWithPrediction);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create(
          'request-failed',
          `Match ${match} could not be fetched`,
          err
        ),
        'Internal Server Error'
      );
    }
  }
  private async getMatchWithPrediction(
    match: Match,
    loggedInUserId: string | undefined
  ) {
    const prediction = await this.findPredictionByUserAndMatch(
      loggedInUserId,
      match.id!
    );
    if (!prediction) {
      return match; // No prediction found, return match as is
    }
    return {
      ...match,
      prediction,
    };
  }

  private async findPredictionByUserAndMatch(
    userId: string | undefined,
    matchId: string
  ) {
    if (!userId) {
      return null; // No userId provided, no prediction to fetch
    }
    const prediction = await lastValueFrom(
      this.predictionRepo.findOneByUserAndMatch$(userId, matchId)
    );
    return prediction;
  }

  private async findMatchById(matchId: string) {
    const match = await lastValueFrom(
      this.matchRepo.findOne$({ id: matchId }, '-createdAt')
    );
    if (!match) {
      throw Result.fail(
        AppError.resourceNotFound(`No match found with id ${matchId}`)
      );
    }
    return match;
  }
}
