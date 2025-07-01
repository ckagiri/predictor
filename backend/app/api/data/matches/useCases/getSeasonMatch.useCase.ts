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
  slug: string;
}

export default class GetSeasonMatchUseCase {
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
    return new GetSeasonMatchUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo
    );
  }

  async execute({ competition, season, slug }: RequestModel): Promise<void> {
    try {
      const validator = makeGetMatchesValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);

      const foundMatch = await lastValueFrom(
        this.matchRepo.findOne$(
          {
            season: foundSeason.id,
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
          'fetch-failed',
          'Season-Match could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
