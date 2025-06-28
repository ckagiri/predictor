import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../../db/repositories/competition.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/season.repo.js';
import { AppError } from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetSeasonsValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  slug: string;
}

export default class GetSeasonUseCase {
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
    return new GetSeasonUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute(requestModel: RequestModel): Promise<void> {
    try {
      const { competition, slug } = requestModel;
      const validator = makeGetSeasonsValidator(this.competitionRepo);
      await validator.validateCompetition(competition);

      const foundSeason = await lastValueFrom(
        this.seasonRepo.findOne$({ slug })
      );

      if (!foundSeason) {
        throw Result.fail(
          AppError.createNotFoundError(
            `Could not find Season with slug ${slug}`
          ),
          'Resource Not Found'
        );
      }
      this.responder.respond(foundSeason);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Competition-Season could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
