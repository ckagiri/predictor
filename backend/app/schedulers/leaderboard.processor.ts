import { concatMap, forkJoin, from, last, lastValueFrom, map, mergeMap, Observable, of } from "rxjs";

import { Leaderboard, BOARD_TYPE } from "../../db/models/leaderboard.model";
import { LeaderboardRepository, LeaderboardRepositoryImpl } from "../../db/repositories/leaderboard.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../db/repositories/prediction.repo";
import { UserScoreRepository, UserScoreRepositoryImpl } from "../../db/repositories/userScore.repo";
import { Match, MatchStatus } from "../../db/models/match.model";
import { uniq } from 'lodash';

// Todo: filter out leaderboards with matchId already processed
function isNonNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export interface LeaderboardProcessor {
  updateScores(seasonId: string, matches: Match[]): Promise<string>;
  updateRankings(seasonId: string, matches: Match[]): Promise<string>;
}

export class LeaderboardProcessorImpl implements LeaderboardProcessor {
  public static getInstance(
    predictionRepo?: PredictionRepository,
    leaderboardRepo?: LeaderboardRepository,
    userScoreRepo?: UserScoreRepository,
  ): LeaderboardProcessor {
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance();
    const leaderboardRepoImpl = leaderboardRepo ?? LeaderboardRepositoryImpl.getInstance();
    const userScoreRepoImpl = userScoreRepo ?? UserScoreRepositoryImpl.getInstance();

    return new LeaderboardProcessorImpl(predictionRepoImpl, leaderboardRepoImpl, userScoreRepoImpl);
  }

  constructor(
    private predictionRepo: PredictionRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository,
  ) { }

  updateScores(seasonId: string, matchesArray: Match[]): Promise<string> {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId })
        .pipe(
          mergeMap(userIds => {
            const seasonLeaderboard$ = this.leaderboardRepo.findOrCreateSeasonLeaderboard$(seasonId);
            const roundLeaderboard$Array: Observable<Leaderboard>[] = gameRoundIds.map(gameRoundId => {
              return this.leaderboardRepo.findOrCreateRoundLeaderboard$(seasonId, gameRoundId)
            });
            return forkJoin([seasonLeaderboard$, ...roundLeaderboard$Array])
              .pipe(
                // Todo: set to processing - in the end set to processed
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
                    map(match => ({ leaderboardId, matchId: match.id! })),
                    mergeMap(({ leaderboardId, matchId }) => from(userIds)
                      .pipe(
                        map(userId => ({ leaderboardId, matchId, userId }))
                      )),
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
                    last(),
                    mergeMap(() => {
                      const matchIds = matches.map(m => m.id!);
                      return this.leaderboardRepo.findByIdAndUpdateMatches$(leaderboardId, matchIds)
                    }),
                  )
                ),
                last(),
                map(() => 'Success')
              )
          }),
        )
    )
  }

  updateRankings(seasonId: string, matchesArray: Match[]): Promise<string> {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.leaderboardRepo.findAllGlobalFor$({ seasonId, gameRoundIds })
        .pipe(
          // Todo: set to processing, end set to processed
          mergeMap(leaderboards => from(leaderboards)),
          mergeMap(leaderboard => {
            return this.leaderboardRepo.findById$(leaderboard.id!)
          }),
          mergeMap(leaderboard => {
            return this.userScoreRepo.findByLeaderboardIdOrderByPoints$(leaderboard.id!)
              .pipe(
                mergeMap(userScores => from(userScores)),
                concatMap((userScore, index) => {
                  const previousPosition = userScore.positionNew || 0;
                  const positionOld = previousPosition;
                  const positionNew = index + 1;
                  if (positionNew === positionOld) {
                    return of(userScore);
                  }
                  return this.userScoreRepo.findByIdAndUpdate$(userScore.id!, {
                    positionNew,
                    positionOld,
                  })
                })
              )
          }),
          last(),
          map(() => 'Success')
        )
    )
  }
}
