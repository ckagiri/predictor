import { omit } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { Match, Prediction, Season } from '../../../../../db/models/index.js';
import { CompetitionRepositoryImpl } from '../../../../../db/repositories/competition.repo';
import { GameRoundRepositoryImpl } from '../../../../../db/repositories/gameRound.repo';
import { MatchRepositoryImpl } from '../../../../../db/repositories/match.repo';
import { PredictionRepositoryImpl } from '../../../../../db/repositories/prediction.repo';
import { SeasonRepositoryImpl } from '../../../../../db/repositories/season.repo';
import { UserRepositoryImpl } from '../../../../../db/repositories/user.repo';
import AppError from '../../../common/AppError';
import Responder from '../../../common/responders/Responder';
import Result from '../../../common/result';
import GetRoundMatchesUseCase from './getRoundMatches.useCase';

export interface RequestModel {
  competition: string;
  loggedInUserId?: string;
  match: string;
  round?: string;
  season?: string;
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
    match,
    round,
    season,
  }: RequestModel): Promise<void> {
    try {
      if (!loggedInUserId) {
        throw Result.fail(AppError.unauthorized());
      }
      const foundCompetition = await this.findCompetition(competition);
      const foundSeason = await this.findSeason(foundCompetition, season);
      const [foundRound] = await this.findRound(foundSeason, round);

      const roundMatches = (await this.getRoundMatches(
        foundRound.id!
      )) as Match[];
      const foundMatch = this.findMatch(
        foundSeason,
        round!,
        roundMatches,
        match
      );

      const jokerPredictions = await this.getJokerPredictions(
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

  findMatch(
    season: Season,
    round: string,
    roundMatches: Match[],
    match: string
  ) {
    const foundMatch = roundMatches.find(m => m.slug === match);
    if (!foundMatch) {
      const competitionSlug = String(season.competition?.slug);
      const seasonSlug = String(season.slug);
      throw Result.fail(
        AppError.validationFailed(
          `No match ${match} found in round ${round} for season ${competitionSlug}-${seasonSlug}`
        )
      );
    }
    return foundMatch;
  }

  async getJokerPredictions(
    userId: string,
    match: Match,
    roundMatches: Match[]
  ) {
    const jokers = await lastValueFrom(
      this.predictionRepo.pickJoker$(userId, match, roundMatches)
    );
    return jokers.map((joker: Prediction) => omit(joker, ['createdAt']));
  }
}
