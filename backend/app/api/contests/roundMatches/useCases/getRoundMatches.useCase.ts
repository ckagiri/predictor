/* eslint-disable perfectionist/sort-objects */
import { lastValueFrom } from 'rxjs';

import {
  BOARD_TYPE,
  Competition,
  GameRound,
  Match,
  Season,
} from '../../../../../db/models/index.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  GameRoundRepository,
  GameRoundRepositoryImpl,
  LeaderboardRepository,
  LeaderboardRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  PredictionRepository,
  PredictionRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
  UserRepository,
  UserRepositoryImpl,
  UserScoreRepository,
  UserScoreRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import {
  makeRoundMatchesValidator,
  RoundMatchesValidator,
} from './roundMatches.validator.js';

export interface RequestModel {
  competition: string;
  loggedInUserId?: string;
  predictorUsername?: string;
  round?: string;
  season?: string;
}

export default class GetRoundMatchesUseCase {
  private readonly validator: RoundMatchesValidator;

  constructor(
    protected responder: Responder,
    protected competitionRepo = CompetitionRepositoryImpl.getInstance(),
    protected seasonRepo = SeasonRepositoryImpl.getInstance(),
    protected roundRepo = GameRoundRepositoryImpl.getInstance(),
    protected matchRepo = MatchRepositoryImpl.getInstance(),
    protected userRepo = UserRepositoryImpl.getInstance(),
    protected predictionRepo = PredictionRepositoryImpl.getInstance(),
    protected leaderboardRepo = LeaderboardRepositoryImpl.getInstance(),
    protected userScoreRepo = UserScoreRepositoryImpl.getInstance()
  ) {
    this.validator = makeRoundMatchesValidator(
      this.competitionRepo,
      this.seasonRepo,
      this.roundRepo
    );
  }

  static getInstance(
    responder: Responder,
    competitionRepo?: CompetitionRepository,
    seasonRepo?: SeasonRepository,
    roundRepo?: GameRoundRepository,
    matchRepo?: MatchRepository,
    userRepo?: UserRepository,
    predictionRepo?: PredictionRepository,
    leaderboardRepo?: LeaderboardRepository,
    userScoreRepo?: UserScoreRepository
  ) {
    return new GetRoundMatchesUseCase(
      responder,
      competitionRepo,
      seasonRepo,
      roundRepo,
      matchRepo,
      userRepo,
      predictionRepo,
      leaderboardRepo,
      userScoreRepo
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
      const matchesWithPredictions = await this.getMatchesWithPredictions(
        matches,
        userId
      );
      const score = await this.getUserScore(foundSeason, foundRound, userId);

      const response = {
        competition: foundCompetition.slug,
        season: foundSeason.slug,
        round: foundRound.slug,
        rounds: rounds,
        teams: foundSeason.teams ?? [],
        matches: matchesWithPredictions,
      } as Record<string, any>;

      if (score) {
        response.score = score;
      }
      this.responder.respond(response);
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
    round?: string
  ): Promise<[GameRound, GameRound[]]> {
    const competitionSlug = String(season.competition?.slug);
    const seasonSlug = String(season.slug);
    const seasonId = String(season.id);
    const currentGameRound = season.currentGameRound?.toString();

    let foundRound: GameRound | undefined;
    if (round) {
      foundRound = await this.validator.validateRound(
        `${competitionSlug}-${seasonSlug}`,
        seasonId,
        round
      );
    } else {
      foundRound = await this.validator.validateCurrentRound(
        `${competitionSlug}-${seasonSlug}`,
        currentGameRound
      );
    }

    const rounds = await lastValueFrom(
      this.roundRepo.findAll$({ season: seasonId }, '-createdAt')
    );

    return [foundRound, rounds];
  }

  protected async findSeason(competition: Competition, seasonSlug?: string) {
    const competitionSlug = competition.slug;
    const currentSeason = competition.currentSeason?.toString();
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
      .map(
        match =>
          ({
            ...match,
            homeTeam: {
              id: match.homeTeam?.id,
              name: match.homeTeam?.name,
            },
            awayTeam: {
              id: match.awayTeam?.id,
              name: match.awayTeam?.name,
            },
          }) as Match
      );
  }

  protected async findMatch(season: Season, match: string) {
    const competitionSlug = String(season.competition?.slug);
    const seasonSlug = String(season.slug);
    const foundMatch = await lastValueFrom(
      this.matchRepo.findOne$(
        {
          season: season.id,
          slug: match,
        },
        '-createdAt -allPredictionPointsCalculated -externalReference -odds'
      )
    );
    if (!foundMatch) {
      throw Result.fail(
        AppError.resourceNotFound(
          `No match ${match} for season ${competitionSlug}-${seasonSlug}`
        )
      );
    }
    return foundMatch;
  }

  protected findRoundMatch(
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
        AppError.resourceNotFound(
          `No match ${match} found in round ${round} for season ${competitionSlug}-${seasonSlug}`
        )
      );
    }
    return foundMatch;
  }

  protected async getMatchesWithPredictions(
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

  protected async getUserScore(
    season: Season,
    round: GameRound,
    userId: string | undefined
  ) {
    if (!userId) {
      return null;
    }

    const leaderboard = await lastValueFrom(
      this.leaderboardRepo.findOne$({
        season: season.id,
        gameRound: round.id,
        boardType: BOARD_TYPE.GLOBAL_ROUND,
      })
    );

    if (!leaderboard) {
      return null;
    }
    const userScore = await lastValueFrom(
      this.userScoreRepo.findOne$(
        {
          leaderboard: leaderboard.id,
          user: userId,
        },
        '-createdAt -user -leaderboard -matches'
      )
    );

    return userScore;
  }
}
