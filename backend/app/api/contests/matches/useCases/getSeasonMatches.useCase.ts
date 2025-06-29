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

export interface RequestModel {
  competition: string;
  season: string;
}

const failWithFetchError = (error: Error) =>
  Result.fail(
    AppError.createError(
      'fetch-failed',
      'Current-Matches for Season could not be fetched',
      error
    ),
    'Internal Server Error'
  );

export default class GetSeasonMatchesUseCase {
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
    return new GetSeasonMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo
    );
  }

  async execute({ competition, season }: RequestModel): Promise<void> {
    try {
      const foundCompetition = await lastValueFrom(
        this.competitionRepo.findOne$({
          slug: competition,
        })
      );
      if (!foundCompetition) {
        throw failWithFetchError(
          new Error(`No competition with slug ${competition}`)
        );
      }

      const foundSeason = await lastValueFrom(
        this.seasonRepo.findOne$({
          'competition.slug': competition,
          slug: season,
        })
      );
      if (!foundSeason) {
        throw failWithFetchError(
          new Error(`No season ${season} for competition ${competition}`)
        );
      }

      const currentRoundId = foundSeason.currentGameRound?.toString();
      if (!currentRoundId) {
        throw failWithFetchError(
          new Error(`No current-round-id for season ${competition}-${season}`)
        );
      }

      const rounds = await lastValueFrom(
        this.roundRepo.findAll$({ season: foundSeason.id })
      );
      const matches = await lastValueFrom(
        this.matchRepo.findAll$({ gameRound: currentRoundId })
      );

      this.responder.respond({
        defaults: {
          round: currentRoundId,
          rounds: rounds,
        },
        matches: matches,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.createError(
          'fetch-failed',
          'Current-Matches for Season could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
