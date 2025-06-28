import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from 'db/repositories/season.repo.js';
import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../../../db/repositories/gameRound.repo.js';
import { AppError, ValidationMessage } from '../../common/AppError.js';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';
import { makeValidator as makeGetRoundsValidator } from './getRounds.useCase.js';

export interface RequestModel {
  competition: string;
  season: string;
  slug: string;
}

export default class GetRoundUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private roundRepo: GameRoundRepository
  ) {}

  public static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance()
  ) {
    return new GetRoundUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo
    );
  }

  async execute(requestModel: RequestModel): Promise<void> {
    try {
      const { competition, season, slug } = requestModel;
      const validator = makeGetRoundsValidator(this.competitionRepo);
      await validator.validateCompetition(competition);

      const foundSeason = await lastValueFrom(
        this.seasonRepo.findOne$({ slug: season })
      );

      if (!foundSeason) {
        const errors: ValidationMessage[] = [
          {
            msg: `No Competition-Season with slug ${season}`,
            param: 'season',
          },
        ];
        throw Result.fail(
          AppError.createValidationError('Bad data', errors),
          'Bad Request'
        );
      }

      const foundRound = await lastValueFrom(
        this.roundRepo.findOne$(
          {
            season: foundSeason.id,
            slug,
          },
          '-createdAt'
        )
      );

      if (!foundRound) {
        throw Result.fail(
          AppError.createNotFoundError(
            `Could not find Round with slug ${slug}`
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
