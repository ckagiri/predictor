import { omit } from 'lodash';
import { lastValueFrom } from 'rxjs';

import {
  Competition,
  GameRound,
  Match,
  Prediction,
  Season,
} from '../../../../../db/models/index.js';
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
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../../../../db/repositories/prediction.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/season.repo.js';
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../../../../db/repositories/user.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import {
  GetRoundMatchesValidator,
  makeGetRoundMatchesValidator,
} from '../getRoundMatches.validator.js';

export interface RequestModel {
  competition: string;
  loggedInUserId?: string;
  predictorUsername?: string;
  round?: string;
  season?: string;
}

export default class GetRoundMatchesUseCase {
  private readonly validator: GetRoundMatchesValidator;

  constructor(
    protected responder: Responder,
    protected competitionRepo: CompetitionRepository,
    protected seasonRepo: SeasonRepository,
    protected roundRepo: GameRoundRepository,
    protected matchRepo: MatchRepository,
    protected userRepo: UserRepository,
    protected predictionRepo: PredictionRepository
  ) {
    this.validator = makeGetRoundMatchesValidator(
      this.competitionRepo,
      this.seasonRepo,
      this.roundRepo
    );
  }

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    roundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    userRepo = UserRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new GetRoundMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo,
      userRepo,
      predictionRepo
    );
  }

  async execute({
    competition,
    loggedInUserId,
    predictorUsername,
    round,
    season,
  }: RequestModel): Promise<void> {
    try {
      const foundCompetition = await this.findCompetition(competition);
      const foundSeason = await this.findSeason(foundCompetition, season);
      const [foundRound, rounds] = await this.findRound(foundSeason, round);
      const matches = await this.getRoundMatches(foundRound.id!);

      // predictorUsername comes from query params
      const userId = await this.getPredictorId(
        loggedInUserId,
        predictorUsername
      );
      const matchesWithPredictions = this.getMatchesWithPredictions(
        matches as Match[],
        userId
      );
      this.responder.respond({
        defaults: {
          competition: foundCompetition.slug,
          round: foundRound.slug,
          rounds: rounds,
          season: foundSeason.slug,
        },
        matches: matchesWithPredictions,
      });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'Current-Matches for Round could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }

  protected async findRound(
    season: Season,
    round: string | undefined
  ): Promise<[GameRound, GameRound[]]> {
    const competitionSlug = String(season.competition?.slug);
    const seasonSlug = String(season.slug);
    const seasonId = String(season.id);
    const currentGameRound = season.currentGameRound;

    let foundRound: GameRound | undefined;
    if (round) {
      foundRound = await this.validator.validateRound(
        `${competitionSlug}-${seasonSlug}`,
        seasonId,
        round
      );
    }
    foundRound = await this.validator.validateCurrentRound(
      `${competitionSlug}-${seasonSlug}`,
      currentGameRound
    );

    const rounds = await lastValueFrom(
      this.roundRepo.findAll$({ season: seasonId }, '-createdAt')
    );

    return [foundRound, rounds];
  }

  protected async findSeason(
    competition: Competition,
    seasonSlug: string | undefined
  ) {
    const competitionSlug = competition.slug;
    const currentSeason = competition.currentSeason;
    if (seasonSlug) {
      return await this.validator.validateSeason(competitionSlug, seasonSlug);
    }

    return await this.validator.validateCurrentSeason(
      competitionSlug,
      currentSeason
    );
  }

  protected async findCompetition(competition: string) {
    return await this.validator.validateCompetition(competition);
  }

  protected async getPredictorId(
    loggedInUserId: string | undefined,
    predictorUsername: string | undefined
  ) {
    let userId: string | undefined;

    if (predictorUsername) {
      const user = await lastValueFrom(
        this.userRepo.findOne$({ username: predictorUsername })
      );
      userId = user?.id;
    } else {
      const user = loggedInUserId
        ? await lastValueFrom(this.userRepo.findById$(loggedInUserId))
        : null;
      userId = user?.id;
    }
    return userId;
  }

  protected async getRoundMatches(roundId: string) {
    const getTime = (date?: Date | number | string): number =>
      date != null ? new Date(date).getTime() : 0;

    const matches = await lastValueFrom(
      this.matchRepo.findAll$(
        { gameRound: roundId },
        '-allGlobalLeaderboardScoresProcessed -allPredictionPointsCalculated -createdAt -externalReference -odds -updatedAt'
      )
    );
    return matches
      .sort((a, b) => getTime(a.utcDate) - getTime(b.utcDate))
      .map(match => {
        return {
          ...match,
          awayTeam: match.awayTeam?.id,
          homeTeam: match.homeTeam?.id,
        };
      });
  }

  protected findMatch(
    season: Season,
    round: string,
    roundMatches: Match[],
    match: string
  ) {
    const foundMatch = roundMatches.find(m => m.slug === match);
    if (!foundMatch) {
      const competitionSlug = String(season.competition?.slug);
      const seasonSlug = String(season.slug);
      throw Result.fail(
        AppError.validationFailed(
          `No match ${match} found in round ${round} for season ${competitionSlug}-${seasonSlug}`
        )
      );
    }
    return foundMatch;
  }

  private async getMatchesWithPredictions(
    roundMatches: Match[],
    userId: string | undefined
  ) {
    if (!userId) return roundMatches;

    const userPredictions = await lastValueFrom(
      this.predictionRepo.findOrCreatePredictions$(userId, roundMatches)
    );
    return roundMatches.map(match => {
      const prediction = userPredictions.find(
        prediction => prediction.match.toString() === match.id
      );
      if (!prediction) {
        return match;
      }
      return {
        ...match,
        prediction,
      };
    });
  }
}
