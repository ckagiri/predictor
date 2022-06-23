import { BOARD_TYPE, STATUS as BOARD_STATUS } from "db/models/leaderboard.model";
import { LeaderboardRepository } from "db/repositories/leaderboard.repo";
import { MatchRepository } from "db/repositories/match.repo";
import { PredictionRepository } from "db/repositories/prediction.repo";
import { UserScoreRepository } from "db/repositories/userScore.repo";
import { count, forkJoin, from, last, lastValueFrom, map, mergeMap, of } from "rxjs";
import { Match } from "../../db/models/match.model";

export interface LeaderboardProcessor {
  updateScores(match: Match): Promise<number>;
  updateRankings(match: Match): Promise<number>;
}

export class LeaderboardProcessorImpl implements LeaderboardProcessor {
  constructor(
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository,
  ) { }

  updateScores(match: Match): any {
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
    throw new Error("Method not implemented.");
  }
}
