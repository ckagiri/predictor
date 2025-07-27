import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../../db/models/match.model.js';
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
  static getInstance(responder: Responder) {
    return new GetMatchUseCase(responder);
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
}
