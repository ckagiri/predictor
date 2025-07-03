import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  GameRoundRepository,
  GameRoundRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetRoundsValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  season: string;
}

export default class GetRoundsUseCase {
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
    return new GetRoundsUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo
    );
  }

  async execute({ competition, season }: RequestModel): Promise<void> {
    try {
      const validator = makeGetRoundsValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);

      const foundRounds = await lastValueFrom(
        this.roundRepo.findAll$({ season: foundSeason.id }, '-createdAt')
      );
      this.responder.respond(foundRounds);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'Season-Rounds could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
