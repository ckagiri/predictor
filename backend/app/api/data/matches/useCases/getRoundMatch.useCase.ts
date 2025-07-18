import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  GameRoundRepository,
  GameRoundRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetMatchesValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  round: string;
  season: string;
  slug: string;
}

export default class GetRoundMatchUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private roundRepo: GameRoundRepository,
    private matchRepo: MatchRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance()
  ) {
    return new GetRoundMatchUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo
    );
  }

  async execute({
    competition,
    round,
    season,
    slug,
  }: RequestModel): Promise<void> {
    try {
      const validator = makeGetMatchesValidator(
        this.competitionRepo,
        this.seasonRepo,
        this.roundRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);
      const foundRound = await validator.validateRound(foundSeason.id!, round);

      const foundMatch = await lastValueFrom(
        this.matchRepo.findOne$(
          {
            gameRound: foundRound.id,
            slug,
          },
          '-createdAt'
        )
      );

      if (!foundMatch) {
        throw Result.fail(
          AppError.resourceNotFound(`Could not find Match with slug ${slug}`)
        );
      }
      this.responder.respond(foundMatch);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create(
          'request-failed',
          'Round-Match could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
