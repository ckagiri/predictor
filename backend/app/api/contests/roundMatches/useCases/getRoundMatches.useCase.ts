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
  authId?: string;
  competition: string;
  predictor?: string;
  round?: string;
  season?: string;
}

export default class GetRoundMatchesUseCase {
  private readonly validator: GetRoundMatchesValidator;

  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private roundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private userRepo: UserRepository,
    private predictionRepo: PredictionRepository
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
    authId: loggedInUserId,
    competition,
    predictor: predictorUsername,
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
          'fetch-failed',
          'Current-Matches for Round could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }

  async findRound(
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

  async findSeason(competition: Competition, seasonSlug: string | undefined) {
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

  async findCompetition(competition: string) {
    return await this.validator.validateCompetition(competition);
  }

  async getPredictorId(
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

  async getMatchesWithPredictions(
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
        prediction: mapPrediction(prediction),
      };
    });

    function mapPrediction(prediction: Prediction) {
      return omit(prediction, 'createdAt', 'updatedAt');
    }
  }

  async getRoundMatches(roundId: string) {
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
}
