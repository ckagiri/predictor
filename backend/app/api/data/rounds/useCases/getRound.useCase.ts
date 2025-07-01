import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../../db/repositories/competition.repo.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../../../../db/repositories/gameRound.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/season.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetRoundsValidator } from '../../useCase.validators.js';

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

  static getInstance(
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

  async execute({ competition, season, slug }: RequestModel): Promise<void> {
    try {
      const validator = makeGetRoundsValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);

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
          AppError.resourceNotFound(`Could not find Round with slug ${slug}`)
        );
      }
      this.responder.respond(foundRound);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create(
          'fetch-failed',
          'Competition-Season could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
