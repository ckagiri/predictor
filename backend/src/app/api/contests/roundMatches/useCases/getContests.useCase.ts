/* eslint-disable perfectionist/sort-objects */
import { lastValueFrom } from 'rxjs';

import { Competition } from '../../../../../db/models/competition.model.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import GetRoundMatchesUseCase from './getRoundMatches.useCase.js';

export interface RequestModel {
  loggedInUserId?: string;
}

export default class GetContestsUseCase extends GetRoundMatchesUseCase {
  static getInstance(responder: Responder) {
    return new GetContestsUseCase(responder);
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
        matches,
        loggedInUserId
      );
      const userScore = await this.getUserScore(
        defaultSeason,
        defaultRound,
        loggedInUserId
      );

      const response = {
        competitions,
        defaults: {
          competition: defaultCompetition.slug,
          season: defaultSeason.slug,
          round: defaultRound.slug,
          rounds,
          teams: defaultSeason.teams ?? [],
          matches: matchesWithPredictions,
        },
      } as Record<string, any>;

      if (userScore) {
        response.score = userScore;
      }
      this.responder.respond(response);
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

    if (competitions.length === 0) {
      throw Result.fail(
        AppError.resourceNotFound('Default competition not found')
      );
    }

    return defaultCompetition ?? competitions[0];
  }
}
