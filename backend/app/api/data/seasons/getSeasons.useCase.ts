import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../db/repositories/season.repo.js';
import { AppError } from '../../common/AppError.js';
import { ValidationMessage } from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';

export default class GetSeasonsUseCase {
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
    return new GetSeasonsUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute(competition: string): Promise<void> {
    try {
      await this.validate(competition);

      const foundSeasons = await lastValueFrom(
        this.seasonRepo.findAll$({ 'competition.slug': competition })
      );

      this.responder.respond(foundSeasons);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(err);
    }
  }

  private async validate(competition: string): Promise<void> {
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
      AppError.createValidationError('Validation Errors', messages),
      'Bad data'
    );
  }
}
