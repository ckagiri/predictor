import { count, forkJoin, from, lastValueFrom, map, mergeMap, Observable } from "rxjs";

import { Leaderboard, STATUS as BOARD_STATUS } from "../../db/models/leaderboard.model";
import { LeaderboardRepository, LeaderboardRepositoryImpl } from "../../db/repositories/leaderboard.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../db/repositories/prediction.repo";
import { UserScoreRepository, UserScoreRepositoryImpl } from "../../db/repositories/userScore.repo";
import { Match, MatchStatus } from "../../db/models/match.model";
import { uniq } from 'lodash';
import { MatchRepositoryImpl } from "../../db/repositories/match.repo";

export interface LeaderboardProcessor {
  updateScores(seasonId: string, matches: Match[]): Promise<number>;
  updateRankings(seasonId: string, matches: Match[]): Promise<number>;
}

export class LeaderboardProcessorImpl implements LeaderboardProcessor {
  public static getInstance(
    predictionRepo?: PredictionRepository,
    leaderboardRepo?: LeaderboardRepository,
    userScoreRepo?: UserScoreRepository,
  ) {
    const predictionRepoImpl = predictionRepo ??
      PredictionRepositoryImpl.getInstance(MatchRepositoryImpl.getInstance());
    const leaderboardRepoImpl = leaderboardRepo ?? LeaderboardRepositoryImpl.getInstance();
    const userScoreRepoImpl = userScoreRepo ?? UserScoreRepositoryImpl.getInstance();

    return new LeaderboardProcessorImpl(predictionRepoImpl, leaderboardRepoImpl, userScoreRepoImpl
    );
  }

  constructor(
    private predictionRepo: PredictionRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository,
  ) { }

  updateScores(seasonId: string, matchesArray: Match[]): Promise<number> {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId })
        .pipe(
          mergeMap(userIds => {
            const seasonLeaderboard$ = this.leaderboardRepo.findOrCreateSeasonLeaderboardAndUpdate$(
              seasonId, { status: BOARD_STATUS.UPDATING_SCORES });
            const roundLeaderboard$Array: Observable<Leaderboard>[] = gameRoundIds.map(gameRoundId => {
              return this.leaderboardRepo.findOrCreateRoundLeaderboardAndUpdate$(
                seasonId, gameRoundId, { status: BOARD_STATUS.UPDATING_SCORES })
            });
            return forkJoin([seasonLeaderboard$, ...roundLeaderboard$Array])
              .pipe(
                mergeMap(leaderboards => from(matches)
                  .pipe(
                    map(match => ({ matchId: match.id!, leaderboards }))
                  )
                ),
                mergeMap(({ matchId, leaderboards }) => from(leaderboards)
                  .pipe(
                    map(leaderboard => ({ matchId, leaderboardId: leaderboard.id! }))
                  )),
                mergeMap(({ matchId, leaderboardId }) => from(userIds)
                  .pipe(
                    map(userId => ({ matchId, leaderboardId, userId }))
                  )
                ),
                mergeMap(({ matchId, leaderboardId, userId }) => {
                  return this.predictionRepo.findOne$(userId, matchId)
                    .pipe(
                      map(prediction => ({ userId, leaderboardId, matchId, prediction }))
                    )
                }),
                mergeMap(({ matchId, leaderboardId, userId, prediction }) => {
                  const { scorePoints: points, hasJoker } = prediction;
                  return this.userScoreRepo.findScoreAndUpsert$(
                    { leaderboardId, userId },
                    points!,
                    {
                      matchId: matchId,
                      predictionId: prediction.id!,
                      hasJoker: hasJoker!
                    }
                  )
                }),
                count()
              )
          }),
          mergeMap(userScoresVisited => {
            const seasonLeaderboard$ = this.leaderboardRepo.findOrCreateSeasonLeaderboardAndUpdate$(
              seasonId, { status: BOARD_STATUS.SCORES_UPDATED });
            const roundLeaderboard$Array: Observable<Leaderboard>[] = gameRoundIds.map(gameRoundId => {
              return this.leaderboardRepo.findOrCreateRoundLeaderboardAndUpdate$(
                seasonId, gameRoundId, { status: BOARD_STATUS.SCORES_UPDATED })
            });
            return forkJoin([seasonLeaderboard$, ...roundLeaderboard$Array])
              .pipe(
                map(() => userScoresVisited)
              )
          })
        )
    )
  }

  updateRankings(seasonId: string, matchesArray: Match[]): any {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.leaderboardRepo.findAllFor$({ seasonId, gameRoundIds })
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
                })
              )
          }),
          count(),
        ).pipe(
          mergeMap(userScoresUpdated => {
            return this.leaderboardRepo.findAndUpdateAllFor$({ seasonId, gameRoundIds }, {
              status: BOARD_STATUS.RANKINGS_UPDATED
            })
              .pipe(map(() => userScoresUpdated))
          })
        )
    )
  }
}
