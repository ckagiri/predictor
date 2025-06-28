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

  public static getInstance(
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
      const validator = makeValidator(this.competitionRepo);
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

      const foundRounds = await lastValueFrom(
        this.roundRepo.findAll$({ season: foundSeason.id }, '-createdAt')
      );
      this.responder.respond(foundRounds);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Season-Rounds could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}

export const makeValidator = (competitionRepo: CompetitionRepository) => {
  return {
    validateCompetition: async function validateCompetition(
      competition: string
    ) {
      const foundCompetition = await lastValueFrom(
        competitionRepo.findOne$({
          slug: competition,
        })
      );

      if (foundCompetition) return;

      const errors: ValidationMessage[] = [
        {
          msg: `No competition with slug ${competition}`,
          param: 'competition',
        },
      ];

      throw Result.fail(
        AppError.createValidationError('Bad data', errors),
        'Bad Request'
      );
    },
  };
};
