import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import { AppError } from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export default class GetCompetitionsUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository
  ) {}

  public static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new GetCompetitionsUseCase(responder, competitionRepo);
  }

  async execute(): Promise<void> {
    try {
      const foundCompetitions = await lastValueFrom(
        this.competitionRepo.findAll$()
      );

      this.responder.respond(foundCompetitions);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Competitions could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
