import { concatMap, count, forkJoin, from, lastValueFrom, map, mergeMap, Observable } from "rxjs";

import { Leaderboard, STATUS as BOARD_STATUS, BOARD_TYPE } from "../../db/models/leaderboard.model";
import { LeaderboardRepository, LeaderboardRepositoryImpl } from "../../db/repositories/leaderboard.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../db/repositories/prediction.repo";
import { UserScoreRepository, UserScoreRepositoryImpl } from "../../db/repositories/userScore.repo";
import { Match, MatchStatus } from "../../db/models/match.model";
import { uniq } from 'lodash';

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
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance();
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
                mergeMap(leaderboards => from(leaderboards)),
                map(leaderboard => {
                  const leaderboardId = leaderboard.id!;
                  if (leaderboard.boardType === BOARD_TYPE.GLOBAL_ROUND) {
                    const roundMatches = matches.filter(
                      m => m.gameRound.toString() === leaderboard.gameRound?.toString()
                    );
                    return { leaderboardId, matches: roundMatches }
                  }
                  return { leaderboardId, matches }
                }),
                mergeMap(({ leaderboardId, matches }) => from(matches)
                  .pipe(
                    map(match => ({ leaderboardId, matchId: match.id! }))
                  )
                ),
                mergeMap(({ leaderboardId, matchId }) => from(userIds)
                  .pipe(
                    map(userId => ({ leaderboardId, matchId, userId }))
                  )
                ),
                mergeMap(({ leaderboardId, matchId, userId }) => {
                  return this.predictionRepo.findOne$(userId, matchId)
                    .pipe(
                      map(prediction => ({ leaderboardId, matchId, userId, prediction }))
                    )
                }),
                concatMap(({ leaderboardId, matchId, userId, prediction }) => {
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
          mergeMap(userScoreCount => {
            const seasonLeaderboard$ = this.leaderboardRepo.findSeasonLeaderboardAndUpdate$(
              seasonId, { status: BOARD_STATUS.SCORES_UPDATED });
            const roundLeaderboard$Array: Observable<Leaderboard>[] = gameRoundIds.map(gameRoundId => {
              return this.leaderboardRepo.findRoundLeaderboardAndUpdate$(
                seasonId, gameRoundId, { status: BOARD_STATUS.SCORES_UPDATED })
            });
            return forkJoin([seasonLeaderboard$, ...roundLeaderboard$Array])
              .pipe(
                map(() => userScoreCount)
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
                concatMap((userScore, index) => {
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
