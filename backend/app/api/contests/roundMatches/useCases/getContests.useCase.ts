/* eslint-disable perfectionist/sort-objects */
import { Competition } from 'db/models/competition.model.js';
import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../../db/models/index.js';
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
  loggedInUserId?: string;
}

export default class GetContestsUseCase extends GetRoundMatchesUseCase {
  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = GameRoundRepositoryImpl.getInstance(),
    teamRepo = MatchRepositoryImpl.getInstance(),
    roundRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new GetContestsUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo,
      teamRepo,
      roundRepo,
      predictionRepo
    );
  }

  async execute({ loggedInUserId }: RequestModel): Promise<void> {
    try {
      const competitions = await lastValueFrom(
        this.competitionRepo.findAll$({}, '-createdAt -externalReference')
      );
      const defaultCompetition = this.getDefaultCompetition(competitions);
      const defaultSeason = await this.findSeason(defaultCompetition);
      const [defaultRound, rounds] = await this.findRound(defaultSeason);
      const matches = await this.getRoundMatches(defaultRound.id!);

      const matchesWithPredictions = await this.getMatchesWithPredictions(
        matches as Match[],
        loggedInUserId
      );
      this.responder.respond({
        competitions,
        defaults: {
          competition: defaultCompetition.slug,
          season: defaultSeason.slug,
          round: defaultRound.slug,
          rounds,
          teams: defaultSeason.teams ?? [],
          matches: matchesWithPredictions,
        },
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create('request-failed', 'Contests could not be fetched', err),
        'Internal Server Error'
      );
    }
  }

  getDefaultCompetition(competitions: Competition[]) {
    const defaultCompetition = competitions.find(
      competition => competition.slug === 'premier-league'
    );
    if (!defaultCompetition) {
      throw Result.fail(
        AppError.resourceNotFound('Default competition not found')
      );
    }
    return defaultCompetition;
  }
}
