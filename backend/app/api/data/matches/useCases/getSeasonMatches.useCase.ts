import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../../db/repositories/competition.repo.js';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../../../../db/repositories/match.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/season.repo.js';
import { AppError } from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetMatchesValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  season: string;
}

export default class GetSeasonMatchesUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance()
  ) {
    return new GetSeasonMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo
    );
  }

  async execute({ competition, season }: RequestModel): Promise<void> {
    try {
      const validator = makeGetMatchesValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);

      const foundMatches = await lastValueFrom(
        this.matchRepo.findAll$({ season: foundSeason.id }, '-createdAt')
      );
      this.responder.respond(foundMatches);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Season-Matches could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
