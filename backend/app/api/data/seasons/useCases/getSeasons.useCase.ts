import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetSeasonsValidator } from '../../useCase.validators.js';

export default class GetSeasonsUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {
    return new GetSeasonsUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute(competition: string): Promise<void> {
    try {
      const validator = makeGetSeasonsValidator(this.competitionRepo);
      await validator.validateCompetition(competition);

      const foundSeasons = await lastValueFrom(
        this.seasonRepo.findAll$({ 'competition.slug': competition })
      );

      this.responder.respond(foundSeasons);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'fetch-failed',
          'Competition-Seasons could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
