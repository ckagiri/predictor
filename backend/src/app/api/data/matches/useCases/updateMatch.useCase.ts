import { ChildProcess } from 'child_process';
import { lastValueFrom } from 'rxjs';

import AppError, {
  ValidationError,
} from '../../../../../app/api/common/AppError.js';
import Result from '../../../../../app/api/common/result/index.js';
import { Odds, Score } from '../../../../../common/score';
import {
  isValidStatusTransition,
  Match,
  MatchStatus,
} from '../../../../../db/models/match.model';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import Responder from '../../../../api/common/responders/Responder.js';
import { makeGetMatchesValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  matchDetails: MatchDetails;
  season: string;
  slug: string;
}
interface MatchDetails {
  gameRound: string;
  matchday: number;
  odds?: Odds;
  score?: Score;
  status: MatchStatus;
  utcDate?: Date;
  venue?: string;
}

export default class UpdateMatchUseCase {
  private backgroundWorker: ChildProcess | null = null;

  constructor(
    private readonly responder: Responder,
    private readonly competitionRepo: CompetitionRepository,
    private readonly seasonRepo: SeasonRepository,
    private readonly matchRepo: MatchRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance()
  ) {
    return new UpdateMatchUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo
    );
  }

  setBackgroundWorker(worker: ChildProcess) {
    this.backgroundWorker = worker;
  }

  async execute(requestModel: RequestModel): Promise<void> {
    const { competition, matchDetails, season, slug } = requestModel;

    try {
      const validator = makeGetMatchesValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);
      const foundMatch = await lastValueFrom(
        this.matchRepo.findOne$({
          season: foundSeason.id,
          slug,
        })
      );

      if (!foundMatch) {
        throw Result.fail(
          AppError.resourceNotFound(`No match found with slug ${slug}`)
        );
      }

      const validationErrors = await this.getValidationErrors(
        foundMatch,
        matchDetails
      );

      if (validationErrors.length > 0) {
        throw Result.fail(
          AppError.validationFailed('Bad data', validationErrors)
        );
      }

      const modifiedMatch = {
        ...foundMatch,
        ...matchDetails,
      } as Match;

      const updatedMatch = await lastValueFrom(
        this.matchRepo.findByIdAndUpdate$(
          foundMatch.id!,
          modifiedMatch,
          '-createdAt'
        )
      );

      this.responder.respond(updatedMatch);

      this.repickJokerIfMatch(foundMatch, updatedMatch);
    } catch (error: any) {
      if (error.isFailure) {
        throw error;
      }
      throw Result.fail(
        AppError.create('request-failed', 'Match could not be updated', error),
        'Internal Server Error'
      );
    }
  }

  repickJokerIfMatch(foundMatch: Match, updatedMatch: Match | null) {
    if (
      foundMatch.gameRound.toString() !== updatedMatch?.gameRound.toString() ||
      foundMatch.status !== updatedMatch.status
    ) {
      this.backgroundWorker?.send({
        data: {
          matchId: foundMatch.id!,
          roundId: foundMatch.gameRound.toString(),
        },
        msg: 'REPICK_JOKER_IF_MATCH',
      });
    }
  }

  private async getValidationErrors(
    foundMatch: Match,
    matchDetails: MatchDetails
  ): Promise<ValidationError[]> {
    const errors = [] as ValidationError[];
    let newMatchRound = null;
    if (foundMatch.gameRound.toString() !== matchDetails.gameRound) {
      newMatchRound = await lastValueFrom(
        this.matchRepo.findById$(matchDetails.gameRound)
      );
      if (!newMatchRound) {
        errors.push({
          msg: `No GameRound found with id ${matchDetails.gameRound}`,
          param: 'gameRound',
        });
      }
    }

    let hasProcessedRoundPredictions = false;
    if (newMatchRound) {
      hasProcessedRoundPredictions = await lastValueFrom(
        this.matchRepo.exists$({
          allPredictionPointsCalculated: true,
          gameRound: newMatchRound.id,
        })
      );
    }

    if (hasProcessedRoundPredictions) {
      errors.push({
        msg: `Cannot update match ${foundMatch.slug} as round predictions have already been processed`,
        param: 'gameRound',
      });
    }

    if (matchDetails.utcDate && matchDetails.utcDate < new Date()) {
      errors.push({
        msg: `Cannot update match ${foundMatch.slug} to a past date`,
        param: 'utcDate',
      });
    }

    if (!isValidStatusTransition(foundMatch.status!, matchDetails.status)) {
      errors.push({
        msg: `Cannot update match ${foundMatch.slug} from status ${foundMatch.status} to ${matchDetails.status}`,
        param: 'status',
      });
    }

    return errors;
  }
}
