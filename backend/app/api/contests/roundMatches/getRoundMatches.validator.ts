import { ObjectId } from 'mongoose';
import { lastValueFrom } from 'rxjs';

import { CompetitionRepository } from '../../../../db/repositories/competition.repo.js';
import { GameRoundRepository } from '../../../../db/repositories/gameRound.repo.js';
import { SeasonRepository } from '../../../../db/repositories/season.repo';
import Result from '../../../api/common/result/index.js';
import AppError from '../../common/AppError.js';

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
        throw Result.fail(
          AppError.validationFailed(`No competition with slug ${competition}`)
        );
      }
      return foundCompetition;
    },
    validateCurrentRound: async (
      competitionSeason: string,
      currentRoundId?: string | ObjectId
    ) => {
      if (!currentRoundId) {
        throw Result.fail(
          AppError.validationFailed(
            `No current-round-id for season ${competitionSeason}`
          )
        );
      }
      const currentRound = await lastValueFrom(
        roundRepo.findById$(currentRoundId)
      );
      if (!currentRound) {
        throw Result.fail(
          AppError.validationFailed(
            `No current round for season ${competitionSeason}`
          )
        );
      }
      return currentRound;
    },
    validateCurrentSeason: async (
      competition: string,
      currentSeasonId?: string | ObjectId
    ) => {
      if (!currentSeasonId) {
        throw Result.fail(
          AppError.validationFailed(
            `No current-season-id for competition ${competition}`
          )
        );
      }
      const currentSeason = await lastValueFrom(
        seasonRepo.findById$(currentSeasonId)
      );
      if (!currentSeason) {
        throw Result.fail(
          AppError.validationFailed(
            `No current season for competition ${competition}`
          )
        );
      }
      return currentSeason;
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
        throw Result.fail(
          AppError.validationFailed(
            `No round ${round} for season ${competitionSeason}`
          )
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
        throw Result.fail(
          AppError.validationFailed(
            `No season ${season} for competition ${competition}`
          )
        );
      }
      return foundSeason;
    },
  };
};
