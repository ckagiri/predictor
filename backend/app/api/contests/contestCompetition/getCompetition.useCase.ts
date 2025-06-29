import { AppError } from 'app/api/common/AppError.js';
import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export default class GetCompetitionUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new GetCompetitionUseCase(responder, competitionRepo);
  }

  async execute(competition: string): Promise<void> {
    try {
      const foundCompetition = await lastValueFrom(
        this.competitionRepo.findOne$({ slug: competition })
      );

      if (!foundCompetition) {
        throw Result.fail(
          AppError.createNotFoundError(
            `Could not find competition with slug ${competition}`
          ),
          'Resource Not Found'
        );
      }
      this.responder.respond({
        competition: foundCompetition,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Competition could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
