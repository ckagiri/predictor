import { AppError } from 'app/api/common/AppError';
import Result from 'app/api/common/result';
import { CompetitionRepository } from 'db/repositories/competition.repo';
import { SeasonRepository } from 'db/repositories/season.repo';
import { lastValueFrom } from 'rxjs';

import { GameRoundRepository } from '../../../../db/repositories/gameRound.repo.js';

const failWithFetchError = (error: Error) =>
  Result.fail(
    AppError.createError(
      'fetch-failed',
      'Matches for Round could not be fetched',
      error
    ),
    'Internal Server Error'
  );

export const makeGetRoundMatchesValidator = (
  competitionRepo: CompetitionRepository,
  seasonRepo: SeasonRepository,
  roundRepo: GameRoundRepository
) => {
  return {
    validateCompetition: async (competition: string) => {
      const foundCompetition = await lastValueFrom(
        competitionRepo.findOne$({
          slug: competition,
        })
      );
      if (!foundCompetition) {
        throw failWithFetchError(
          new Error(`No competition with slug ${competition}`)
        );
      }
      return foundCompetition;
    },
    validateRound: async (
      competitionSeason: string,
      seasonId: string,
      round: string
    ) => {
      const foundRound = await lastValueFrom(
        roundRepo.findOne$({ season: seasonId, slug: round })
      );
      if (!foundRound) {
        throw failWithFetchError(
          new Error(`No round ${round} for season ${competitionSeason}`)
        );
      }
      return foundRound;
    },
    validateSeason: async (competition: string, season: string) => {
      const foundSeason = await lastValueFrom(
        seasonRepo.findOne$({
          'competition.slug': competition,
          slug: season,
        })
      );
      if (!foundSeason) {
        throw failWithFetchError(
          new Error(`No season ${season} for competition ${competition}`)
        );
      }
      return foundSeason;
    },
  };
};
