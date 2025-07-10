import { lastValueFrom } from 'rxjs';

import { Match } from '../../../../../db/models/index.js';
import AppError from '../../../common/AppError';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result';
import GetRoundMatchesUseCase from './getRoundMatches.useCase';

export interface RequestModel {
  competition: string;
  loggedInUserId: string;
  round: string;
  season: string;
}

export default class AutoPickPredictions extends GetRoundMatchesUseCase {
  static getInstance(responder: Responder) {
    return new AutoPickPredictions(responder);
  }

  async execute({
    competition,
    loggedInUserId,
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
      const picks = await lastValueFrom(
        this.predictionRepo.findOrCreatePicks$(loggedInUserId, roundMatches)
      );
      this.responder.respond(picks);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'Failed to auto-pick predictions',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
