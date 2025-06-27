import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../db/repositories/season.repo.js';
import { AppError, ValidationMessage } from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

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

  public static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {
    return new GetSeasonUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute(requestModel: RequestModel): Promise<void> {
    try {
      await this.validate(requestModel);

      const { slug } = requestModel;
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
          'Season could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
  private async validate({ competition }: RequestModel) {
    const messages = [] as ValidationMessage[];

    const foundCompetition = await lastValueFrom(
      this.competitionRepo.findOne$({
        slug: competition,
      })
    );

    if (foundCompetition) return;

    messages.push({
      msg: `No competition with slug ${competition}`,
      param: 'competition',
    });

    throw Result.fail(
      AppError.createValidationError('Bad data', messages),
      'Bad Request'
    );
  }
}
