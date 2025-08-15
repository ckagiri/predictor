import { lastValueFrom } from 'rxjs';

import { Odds, Score } from '../../../../../common/score.js';
import {
  isValidStatusTransition,
  Match,
  MatchStatus,
} from '../../../../../db/models/match.model.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError, { ValidationError } from '../../../common/AppError.js';
import { BackgroundWorker } from '../../../common/BackgroundWorker.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetMatchesValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  matchDetails: MatchDetails;
  season: string;
  slug: string;
}
interface MatchDetails {
  gameRound?: string;
  matchday?: number;
  odds?: Odds;
  score?: Score;
  status?: MatchStatus;
  utcDate?: Date;
  venue?: string;
}

interface MatchPartial {
  roundId: string;
  status: MatchStatus;
}
export default class UpdateSeasonMatchUseCase {
  private backgroundWorker: BackgroundWorker | null = null;

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
    return new UpdateSeasonMatchUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo
    );
  }

  setBackgroundWorker(worker: BackgroundWorker) {
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
          AppError.validationFailed('Bad Data', validationErrors)
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

      this.repickJokerIfApplicable(foundMatch, updatedMatch);
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

  repickJokerIfApplicable(foundMatch: Match, updatedMatch: Match | null) {
    if (!updatedMatch) {
      return;
    }
    const repickJoker = shouldRepickJoker({
      original: {
        roundId: foundMatch.gameRound.toString(),
        status: foundMatch.status!,
      },
      updated: {
        roundId: updatedMatch.gameRound.toString(),
        status: updatedMatch.status!,
      },
    });

    if (repickJoker) {
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
    if (
      matchDetails.gameRound &&
      foundMatch.gameRound.toString() !== matchDetails.gameRound
    ) {
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

    if (
      matchDetails.status &&
      !isValidStatusTransition(foundMatch.status!, matchDetails.status)
    ) {
      errors.push({
        msg: `Cannot update match ${foundMatch.slug} from status ${foundMatch.status!} to ${matchDetails.status}`,
        param: 'status',
      });
    }

    return errors;
  }
}

function shouldRepickJoker({
  original,
  updated,
}: {
  original: MatchPartial;
  updated: MatchPartial;
}): boolean {
  if (
    original.status === MatchStatus.SCHEDULED &&
    [MatchStatus.CANCELLED, MatchStatus.POSTPONED].includes(updated.status)
  ) {
    return true;
  }

  if (original.roundId !== updated.roundId) {
    return true;
  }

  return false;
}
