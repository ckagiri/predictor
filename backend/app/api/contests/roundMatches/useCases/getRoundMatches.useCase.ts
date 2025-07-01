import { lastValueFrom } from 'rxjs';

import { GameRound, Season } from '../../../../../db/models/index.js';
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
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetRoundMatchesValidator } from '../getRoundMatches.validator.js';

export interface RequestModel {
  competition: string;
  round?: string;
  season?: string;
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
      const validator = makeGetRoundMatchesValidator(
        this.competitionRepo,
        this.seasonRepo,
        this.roundRepo
      );
      const foundCompetition = await validator.validateCompetition(competition);
      let foundSeason: Season;
      if (season) {
        foundSeason = await validator.validateSeason(competition, season);
      } else {
        foundSeason = await validator.validateCurrentSeason(
          competition,
          foundCompetition.currentSeason
        );
      }
      let foundRound: GameRound;
      if (round) {
        foundRound = await validator.validateRound(
          `${competition}-${foundSeason.slug!}`,
          foundSeason.id!,
          round
        );
      } else {
        foundRound = await validator.validateCurrentRound(
          `${competition}-${foundSeason.slug!}`,
          foundSeason.currentGameRound
        );
      }

      const rounds = await lastValueFrom(
        this.roundRepo.findAll$({ season: foundSeason.id })
      );
      const matches = await lastValueFrom(
        this.matchRepo.findAll$({ gameRound: foundRound.id })
      );

      this.responder.respond({
        defaults: {
          competition: foundCompetition.slug,
          round: foundRound.slug,
          rounds: rounds,
          season: foundSeason.slug,
        },
        matches: matches,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'fetch-failed',
          'Current-Matches for Round could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
