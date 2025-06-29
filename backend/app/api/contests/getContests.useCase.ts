import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../db/repositories/competition.repo.js';
import { AppError } from '../common/AppError.js';
import Responder from '../common/responders/Responder.js';
import Result from '../common/result/index.js';

export default class GetContestsUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new GetContestsUseCase(responder, competitionRepo);
  }

  async execute(): Promise<void> {
    try {
      const foundCompetitions = await lastValueFrom(
        this.competitionRepo.findAll$()
      );

      this.responder.respond({
        competitions: foundCompetitions,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Contests could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
