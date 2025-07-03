import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import { SeasonRepositoryImpl } from '../../../../db/repositories/season.repo.js';
import AppError from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export default class GetCompetitionUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {
    return new GetCompetitionUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute(competition: string): Promise<void> {
    try {
      const foundCompetition = await lastValueFrom(
        this.competitionRepo.findOne$(
          { slug: competition },
          '-createdAt -externalReference'
        )
      );
      const seasons = await lastValueFrom(
        this.seasonRepo.findAll$(
          { 'competition.slug': competition },
          '-createdAt -externalReference -teams -competition'
        )
      );

      if (!foundCompetition) {
        throw Result.fail(
          AppError.resourceNotFound(
            `Could not find competition with slug ${competition}`
          )
        );
      }
      this.responder.respond({
        competition: foundCompetition,
        seasons,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create(
          'fetch-failed',
          'Competition could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
