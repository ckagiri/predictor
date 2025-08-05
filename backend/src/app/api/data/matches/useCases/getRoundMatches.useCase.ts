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
}

export default class GetRoundMatchesUseCase {
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
    return new GetRoundMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo
    );
  }

  async execute({ competition, round, season }: RequestModel): Promise<void> {
    try {
      const validator = makeGetMatchesValidator(
        this.competitionRepo,
        this.seasonRepo,
        this.roundRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);
      const foundRound = await validator.validateRound(foundSeason.id!, round);

      console.log('foundRound', foundRound);
      const foundMatches = await lastValueFrom(
        this.matchRepo.findAll$(
          { gameRound: foundRound.id },
          '-createdAt -odds'
        )
      );
      this.responder.respond(foundMatches);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'Round-Matches could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
