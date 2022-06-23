import { count, forkJoin, from, last, lastValueFrom, map, mergeMap } from "rxjs";

import { STATUS as BOARD_STATUS } from "../../db/models/leaderboard.model";
import { LeaderboardRepository, LeaderboardRepositoryImpl } from "../../db/repositories/leaderboard.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../db/repositories/match.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../db/repositories/prediction.repo";
import { UserScoreRepository, UserScoreRepositoryImpl } from "../../db/repositories/userScore.repo";
import { Match } from "../../db/models/match.model";

export interface LeaderboardProcessor {
  updateScores(match: Match): Promise<number>;
  updateRankings(match: Match): Promise<number>;
}

export class LeaderboardProcessorImpl implements LeaderboardProcessor {
  public static getInstance(
    matchRepo?: MatchRepository,
    predictionRepo?: PredictionRepository,
    leaderboardRepo?: LeaderboardRepository,
    userScoreRepo?: UserScoreRepository,
  ) {
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance();
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance(matchRepoImpl);
    const leaderboardRepoImpl = leaderboardRepo ?? LeaderboardRepositoryImpl.getInstance();
    const userScoreRepoImpl = userScoreRepo ?? UserScoreRepositoryImpl.getInstance();

    return new LeaderboardProcessorImpl(
      matchRepoImpl, predictionRepoImpl, leaderboardRepoImpl, userScoreRepoImpl
    );
  }

  constructor(
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository,
  ) { }

  updateScores(match: Match): Promise<number> {
    const { season, gameRound } = match;
    const seasonLeaderboard$ = this.leaderboardRepo.findOrCreateSeasonLeaderboardAndUpdate$(
      season, { status: BOARD_STATUS.UPDATING_SCORES });
    const roundLeaderboard$ = this.leaderboardRepo.findOrCreateRoundLeaderboardAndUpdate$(
      season, gameRound, { status: BOARD_STATUS.UPDATING_SCORES });

    return lastValueFrom(
      forkJoin([seasonLeaderboard$, roundLeaderboard$])
        .pipe(
          mergeMap(leaderboards => {
            return this.predictionRepo.distinct$('user', { season })
              .pipe(
                mergeMap(users => from(leaderboards)
                  .pipe(
                    map(leaderboard => ({ leaderboard, users }))
                  )),
                mergeMap(({ leaderboard, users }) => from(users)
                  .pipe(
                    map(user => ({ leaderboard, user }))
                  )),
                mergeMap(({ leaderboard, user }) => {
                  return this.predictionRepo.findOne$(user, match.id!)
                    .pipe(
                      map(prediction => ({ leaderboard, user, prediction }))
                    )
                }),
                mergeMap(({ leaderboard, user: userId, prediction }) => {
                  const { scorePoints: points, hasJoker } = prediction;
                  return this.userScoreRepo.findScoreAndUpsert$(
                    {
                      leaderboardId: leaderboard.id!,
                      userId
                    },
                    points!,
                    {
                      matchId: match.id!,
                      predictionId: prediction.id!,
                      hasJoker: hasJoker!
                    }
                  )
                }),
                count(),
                mergeMap(count => from(leaderboards)
                  .pipe(
                    mergeMap(leaderboard => {
                      return this.leaderboardRepo.findByIdAndUpdate$(leaderboard.id!,
                        { status: BOARD_STATUS.SCORES_UPDATED })
                    }),
                    last(),
                    map(() => count)
                  )
                )
              )
          }),
          mergeMap(userScoresUpdated => {
            return this.matchRepo.findByIdAndUpdate$(match.id!, { allLeaderboardScoresUpdated: true })
              .pipe(map(() => userScoresUpdated))
          })
        ))
  }

  updateRankings(match: Match): Promise<number> {
    const { season, gameRound } = match;

    return lastValueFrom(
      this.leaderboardRepo.findAllFor$({ seasonId: season, gameRoundId: gameRound })
        .pipe(
          mergeMap(leaderboards => from(leaderboards)),
          mergeMap(leaderboard => {
            return this.leaderboardRepo.findByIdAndUpdate$(leaderboard.id!, {
              status: BOARD_STATUS.UPDATING_RANKINGS
            })
          }),
          mergeMap(leaderboard => {
            return this.userScoreRepo.findByLeaderboardIdOrderByPoints$(leaderboard.id!)
              .pipe(
                mergeMap(userScores => from(userScores)),
                mergeMap((userScore, index) => {
                  const previousPosition = userScore.positionNew || 0;
                  const positionOld = previousPosition;
                  const positionNew = index + 1;
                  return this.userScoreRepo.findByIdAndUpdate$(userScore.id!, {
                    positionNew,
                    positionOld,
                  })
                }),
                last(),
                mergeMap(() => {
                  return this.leaderboardRepo.findByIdAndUpdate$(leaderboard.id!, {
                    status: BOARD_STATUS.RANKINGS_UPDATED
                  })
                })
              )
          }),
          count(),
          mergeMap(leaderboardsUpdated => {
            return this.matchRepo.findByIdAndUpdate$(match.id!, { allLeaderboardRankingsUpdated: true })
              .pipe(map(() => leaderboardsUpdated))
          })
        )
    )
  }
}
