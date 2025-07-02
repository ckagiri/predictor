import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../db/models/match.model.js';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../../db/repositories/match.repo.js';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../../../db/repositories/prediction.repo.js';
import AppError from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export interface RequestModel {
  loggedInUserId?: string;
  matchId: string;
}

export default class GetMatchUseCase {
  constructor(
    private responder: Responder,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) {}

  static getInstance(
    responder: Responder,
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new GetMatchUseCase(responder, matchRepo, predictionRepo);
  }

  async execute({ loggedInUserId, matchId }: RequestModel): Promise<void> {
    try {
      const foundMatch = await this.findMatchById(matchId);
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
          `Match ${matchId} could not be fetched`,
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
