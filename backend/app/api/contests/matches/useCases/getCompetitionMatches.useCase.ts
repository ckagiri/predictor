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
}

const failWithFetchError = (error: Error) =>
  Result.fail(
    AppError.createError(
      'fetch-failed',
      'Current-Matches for Competition could not be fetched',
      error
    ),
    'Internal Server Error'
  );

export default class GetCompetitionMatchesUseCase {
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
    return new GetCompetitionMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo
    );
  }

  async execute({ competition }: RequestModel): Promise<void> {
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
      if (!foundCompetition.currentSeason) {
        throw failWithFetchError(
          new Error(`No current-season-id for competition ${competition}`)
        );
      }

      const currentSeason = await lastValueFrom(
        this.seasonRepo.findById$(foundCompetition.currentSeason)
      );
      if (!currentSeason) {
        throw failWithFetchError(
          new Error(`No current-season for competition ${competition}`)
        );
      }

      const currentRoundId = currentSeason.currentGameRound?.toString();
      if (!currentRoundId) {
        throw failWithFetchError(
          new Error(
            `No current-round-id for season ${competition}-${String(currentSeason.slug)}`
          )
        );
      }

      const rounds = await lastValueFrom(
        this.roundRepo.findAll$({ season: currentSeason.id })
      );
      const matches = await lastValueFrom(
        this.matchRepo.findAll$({ gameRound: currentRoundId })
      );

      this.responder.respond({
        defaults: {
          round: currentRoundId,
          rounds: rounds,
          season: currentSeason,
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
          'Season-Matches could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
