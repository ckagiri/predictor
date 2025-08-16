import { uniq } from 'lodash';
import {
  concatMap,
  filter,
  forkJoin,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  takeLast,
  tap,
  throwError,
} from 'rxjs';

import { BOARD_TYPE, Leaderboard } from '../../db/models/leaderboard.model.js';
import { Match, MatchStatus } from '../../db/models/match.model.js';
import {
  LeaderboardRepository,
  LeaderboardRepositoryImpl,
} from '../../db/repositories/leaderboard.repo.js';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo.js';
import {
  UserScoreRepository,
  UserScoreRepositoryImpl,
} from '../../db/repositories/userScore.repo.js';

export interface LeaderboardProcessor {
  updateRankings(seasonId: string, matches: Match[]): Promise<undefined>;
  updateScores(seasonId: string, matches: Match[]): Promise<undefined>;
}

export class LeaderboardProcessorImpl implements LeaderboardProcessor {
  constructor(
    private predictionRepo: PredictionRepository,
    private leaderboardRepo: LeaderboardRepository,
    private userScoreRepo: UserScoreRepository
  ) {}

  public static getInstance(
    predictionRepo?: PredictionRepository,
    leaderboardRepo?: LeaderboardRepository,
    userScoreRepo?: UserScoreRepository
  ): LeaderboardProcessor {
    const predictionRepoImpl =
      predictionRepo ?? PredictionRepositoryImpl.getInstance();
    const leaderboardRepoImpl =
      leaderboardRepo ?? LeaderboardRepositoryImpl.getInstance();
    const userScoreRepoImpl =
      userScoreRepo ?? UserScoreRepositoryImpl.getInstance();

    return new LeaderboardProcessorImpl(
      predictionRepoImpl,
      leaderboardRepoImpl,
      userScoreRepoImpl
    );
  }

  updateRankings(seasonId: string, seasonMatches: Match[]): Promise<undefined> {
    const matches = seasonMatches.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId
    );
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.leaderboardRepo.findAllGlobalFor$({ gameRoundIds, seasonId }).pipe(
        mergeMap(leaderboards => from(leaderboards)),
        mergeMap(leaderboard => {
          return this.leaderboardRepo.findById$(leaderboard.id!);
        }),
        mergeMap(leaderboard => {
          return this.userScoreRepo
            .findByLeaderboardIdOrderByPoints$(leaderboard?.id!)
            .pipe(
              mergeMap(userScores => from(userScores)),
              concatMap((userScore, index) => {
                const previousPosition = userScore.positionNew ?? 0;
                const positionOld = previousPosition;
                const positionNew = index + 1;
                if (positionNew === positionOld) {
                  return of(userScore);
                }
                return this.userScoreRepo.findByIdAndUpdate$(userScore.id!, {
                  positionNew,
                  positionOld,
                });
              }),
              takeLast(1),
              tap(() => {
                console.log(
                  `All positions updated for ${leaderboard?.boardType!} ${leaderboard?.id!}`
                );
              })
            );
        }),
        takeLast(1),
        mergeMap(() => of(undefined)),
        tap(() => {
          console.log('All positions updated for all leaderboards');
        })
      )
    );
  }

  updateScores(seasonId: string, seasonMatches: Match[]): Promise<undefined> {
    const matches = seasonMatches.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId
    );
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId }).pipe(
        mergeMap(userIds => {
          const seasonLeaderboard$ =
            this.leaderboardRepo.findOrCreateSeasonLeaderboard$(seasonId);
          const roundLeaderboards$: Observable<Leaderboard>[] =
            gameRoundIds.map(gameRoundId => {
              return this.leaderboardRepo.findOrCreateRoundLeaderboard$(
                seasonId,
                gameRoundId
              );
            });
          return forkJoin([seasonLeaderboard$, ...roundLeaderboards$]).pipe(
            mergeMap(leaderboards => from(leaderboards)),
            map(leaderboard => {
              const leaderboardId = leaderboard.id!;
              if (leaderboard.boardType === BOARD_TYPE.GLOBAL_ROUND) {
                const roundMatches = matches.filter(
                  m =>
                    m.gameRound.toString() === leaderboard.gameRound?.toString()
                );
                return { leaderboardId, matches: roundMatches };
              }
              return { leaderboardId, matches };
            }),
            mergeMap(({ leaderboardId, matches }) =>
              from(matches).pipe(
                map(match => ({ leaderboardId, matchId: match.id! })),
                mergeMap(({ leaderboardId, matchId }) =>
                  from(userIds).pipe(
                    map(userId => ({ leaderboardId, matchId, userId }))
                  )
                ),
                mergeMap(({ leaderboardId, matchId, userId }) => {
                  return this.predictionRepo
                    .findOneByUserAndMatch$(userId, matchId)
                    .pipe(
                      filter(prediction => !!prediction),
                      map(prediction => ({
                        leaderboardId,
                        matchId,
                        prediction,
                        userId,
                      }))
                    );
                }),
                concatMap(({ leaderboardId, matchId, prediction, userId }) => {
                  const { hasJoker, scorePoints: points } = prediction;
                  if (!points) {
                    return throwError(
                      () => new Error('No points for prediction')
                    );
                  }
                  return this.userScoreRepo.findScoreAndUpsert$(
                    { leaderboardId, userId },
                    points,
                    {
                      hasJoker: hasJoker!,
                      matchId: matchId,
                      predictionId: prediction.id!,
                    }
                  );
                }),
                takeLast(1),
                map(() => ({ leaderboardId, matches }))
              )
            ),
            mergeMap(({ leaderboardId, matches }) => {
              const matchIds = matches.map(m => m.id!);
              return this.leaderboardRepo.findByIdAndUpdateMatches$(
                leaderboardId,
                matchIds
              );
            })
          );
        }),
        takeLast(1),
        mergeMap(() => of(undefined)),
        tap(() => {
          console.log('All scores updated for all leaderboards');
        })
      )
    );
  }
}
