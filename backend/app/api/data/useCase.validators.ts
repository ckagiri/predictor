import { lastValueFrom } from 'rxjs';

import { CompetitionRepository } from '../../../db/repositories/competition.repo';
import { GameRoundRepository } from '../../../db/repositories/gameRound.repo';
import { SeasonRepository } from '../../../db/repositories/season.repo';
import { AppError } from '../common/AppError';
import Result from '../common/result';

export const makeGetSeasonsValidator = (
  competitionRepo: CompetitionRepository
) => {
  return {
    validateCompetition: async (competition: string) => {
      const foundCompetition = await lastValueFrom(
        competitionRepo.findOne$({
          slug: competition,
        })
      );

      if (!foundCompetition) {
        throw Result.fail(
          AppError.validationFailed([
            {
              msg: `No competition with slug ${competition}`,
              param: 'competition',
            },
          ])
        );
      }
      return foundCompetition;
    },
  };
};

const makeGetSeasonResourcesValidator = (
  competitionRepo: CompetitionRepository,
  seasonRepo: SeasonRepository
) => {
  const validator = makeGetSeasonsValidator(competitionRepo);

  return {
    ...validator,
    validateSeason: async (competition: string, season: string) => {
      const foundSeason = await lastValueFrom(
        seasonRepo.findOne$({ 'competition.slug': competition, slug: season })
      );

      if (!foundSeason) {
        throw Result.fail(
          AppError.validationFailed([
            {
              msg: `No Competition-Season with slug ${season}`,
              param: 'season',
            },
          ])
        );
      }

      return foundSeason;
    },
  };
};
export const makeGetRoundsValidator = makeGetSeasonResourcesValidator;
export const makeGetSeasonTeamsValidator = (
  competitionRepo: CompetitionRepository,
  seasonRepo: SeasonRepository
) => {
  const validator = makeGetSeasonsValidator(competitionRepo);
  return {
    ...validator,
    validateSeason: async (competition: string, season: string) => {
      const foundSeason = await lastValueFrom(
        seasonRepo.findOne$(
          { 'competition.slug': competition, slug: season },
          null,
          { path: 'teams', select: '-createdAt' }
        )
      );

      if (!foundSeason) {
        throw Result.fail(
          AppError.validationFailed([
            {
              msg: `No Competition-Season with slug ${season}`,
              param: 'season',
            },
          ])
        );
      }

      return foundSeason;
    },
  };
};

export const makeGetMatchesValidator = (
  competitionRepo: CompetitionRepository,
  seasonRepo: SeasonRepository,
  roundRepo: GameRoundRepository | null = null
) => {
  const validator = makeGetSeasonResourcesValidator(
    competitionRepo,
    seasonRepo
  );
  return {
    ...validator,
    validateRound: async (seasonId: string, round: string) => {
      if (!roundRepo) {
        throw Result.fail(
          AppError.validationFailed('Round repository is not provided')
        );
      }

      const foundRound = await lastValueFrom(
        roundRepo.findOne$({ season: seasonId, slug: round })
      );

      if (!foundRound) {
        throw Result.fail(
          AppError.validationFailed([
            {
              msg: `No Season-Round with slug ${round}`,
              param: 'round',
            },
          ])
        );
      }

      return foundRound;
    },
  };
};
