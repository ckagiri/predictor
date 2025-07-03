import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../../db/models/index.js';
import {
  CompetitionRepositoryImpl,
  GameRoundRepositoryImpl,
  MatchRepositoryImpl,
  PredictionRepositoryImpl,
  SeasonRepositoryImpl,
  UserRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError';
import Responder from '../../../common/responders/Responder';
import Result from '../../../common/result';
import GetRoundMatchesUseCase from './getRoundMatches.useCase';

export interface RequestModel {
  competition: string;
  loggedInUserId: string;
  matchSlug: string;
  round: string;
  season: string;
}

export default class PickJokerUseCase extends GetRoundMatchesUseCase {
  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new PickJokerUseCase(
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
    matchSlug,
    round,
    season,
  }: RequestModel): Promise<void> {
    try {
      const foundCompetition = await this.findCompetition(competition);
      const foundSeason = await this.findSeason(foundCompetition, season);
      const [foundRound] = await this.findRound(foundSeason, round);

      const roundMatches = (await this.getRoundMatches(
        foundRound.id!
      )) as Match[];
      const foundMatch = this.findRoundMatch(
        foundSeason,
        round,
        roundMatches,
        matchSlug
      );

      const jokerPredictions = await this.pickJoker(
        loggedInUserId,
        foundMatch,
        roundMatches
      );

      this.responder.respond(jokerPredictions);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create('request-failed', 'Failed to pick round joker', err),
        'Internal Server Error'
      );
    }
  }

  async pickJoker(userId: string, match: Match, roundMatches: Match[]) {
    return await lastValueFrom(
      this.predictionRepo.pickJoker$(userId, match, roundMatches)
    );
  }
}
