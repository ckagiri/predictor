import { omit } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { Score } from '../../../../../common/score.js';
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
  scoreChoice: Score;
  season?: string;
}

export default class PickPredictionScore extends GetRoundMatchesUseCase {
  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new PickPredictionScore(
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
    scoreChoice,
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

      const pick = await lastValueFrom(
        this.predictionRepo.pickScore$(
          loggedInUserId,
          foundMatch,
          roundMatches,
          scoreChoice
        )
      );
      this.responder.respond(pick);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create('request-failed', 'Failed to make prediction', err),
        'Internal Server Error'
      );
    }
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
