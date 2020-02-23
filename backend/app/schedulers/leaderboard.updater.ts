import { from, Observable, forkJoin } from 'rxjs';
import {
  concatMap,
  count,
  distinct,
  filter,
  flatMap,
  map,
} from 'rxjs/operators';

import { MatchEntity, MatchStatus } from '../../db/models/match.model';
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../db/repositories/user.repo';
import {
  BOARD_STATUS,
  LeaderboardEntity,
} from '../../db/models/leaderboard.model';
import {
  LeaderboardRepository,
  LeaderboardRepositoryImpl,
} from '../../db/repositories/leaderboard.repo';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo';
import {
  UserScoreRepository,
  UserScoreRepositoryImpl,
} from '../../db/repositories/userScore.repo';
import {
  ICacheService,
  CacheService,
} from '../../common/observableCacheService';

export interface ILeaderboardUpdater {
  updateScores(matches: MatchEntity[]): Promise<number>;
  updateRankings(seasonId: string): Promise<number>;
  markLeaderboardsAsRefreshed(seasonId: string): Promise<number>;
}

export class LeaderboardUpdater implements ILeaderboardUpdater {
  public static getInstance() {
    return new LeaderboardUpdater(
      UserRepositoryImpl.getInstance(),
      LeaderboardRepositoryImpl.getInstance(),
      PredictionRepositoryImpl.getInstance(),
      UserScoreRepositoryImpl.getInstance(),
    ).setCacheService(new CacheService());
  }

  private cacheService: ICacheService | undefined;

  constructor(
    private userRepo: UserRepository,
    private leaderboardRepo: LeaderboardRepository,
    private predictionRepo: PredictionRepository,
    private userScoreRepo: UserScoreRepository,
  ) {}

  public setCacheService(cacheService: ICacheService) {
    this.cacheService = cacheService;
    return this;
  }

  public updateScores(matches: MatchEntity[]) {
    if (this.cacheService != null) {
      this.cacheService.clear();
    }
    return from(matches)
      .pipe(
        filter(match => {
          return (
            match.status === MatchStatus.FINISHED &&
            match.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        flatMap(match => {
          return this.userRepo
            .findAll$()
            .pipe(
              flatMap(users => {
                return from(users);
              }),
            )
            .pipe(
              map(user => {
                return { user, match };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const { user, match } = data;
          const { season, gameRound, date } = match;
          const month = date.getUTCMonth() + 1;
          const year = date.getFullYear();

          const boards: Array<Observable<LeaderboardEntity>> = [];
          let sBoard: Observable<LeaderboardEntity>;
          let mBoard: Observable<LeaderboardEntity>;
          let rBoard: Observable<LeaderboardEntity>;

          if (this.cacheService != null) {
            sBoard = this.cacheService.get(
              `${season}`,
              this.leaderboardRepo.findSeasonBoardAndUpsert$(season!, {
                status: BOARD_STATUS.UPDATING_SCORES,
              }),
            );
            mBoard = this.cacheService.get(
              `${season}-${year}-${month}`,
              this.leaderboardRepo.findMonthBoardAndUpsert$(
                season!,
                year,
                month,
                {
                  status: BOARD_STATUS.UPDATING_SCORES,
                },
              ),
            );
            rBoard = this.cacheService.get(
              `${season}-${gameRound}`,
              this.leaderboardRepo.findRoundBoardAndUpsert$(
                season!,
                gameRound!,
                {
                  status: BOARD_STATUS.UPDATING_SCORES,
                },
              ),
            );
          } else {
            sBoard = this.leaderboardRepo.findSeasonBoardAndUpsert$(season!, {
              status: BOARD_STATUS.UPDATING_SCORES,
            });
            mBoard = this.leaderboardRepo.findMonthBoardAndUpsert$(
              season!,
              year,
              month,
              {
                status: BOARD_STATUS.UPDATING_SCORES,
              },
            );
            rBoard = this.leaderboardRepo.findRoundBoardAndUpsert$(
              season!,
              gameRound!,
              {
                status: BOARD_STATUS.UPDATING_SCORES,
              },
            );
          }
          boards.push(sBoard, mBoard, rBoard);
          return forkJoin(boards)
            .pipe(
              flatMap(leaderboards => {
                return from(leaderboards);
              }),
            )
            .pipe(
              map(leaderboard => {
                return { user, match, leaderboard };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const { user, match, leaderboard } = data;
          return this.predictionRepo
            .findOne$({ userId: user.id, matchId: match.id })
            .pipe(
              map(prediction => {
                return { user, match, leaderboard, prediction };
              }),
            );
        }),
      )
      .pipe(
        concatMap(data => {
          const { user, match, leaderboard, prediction } = data;
          const userId = user.id!;
          const matchId = match.id!;
          const leaderboardId = leaderboard.id!;
          const predictionId = prediction.id!;
          const { scorePoints: points, hasJoker } = prediction;
          return this.userScoreRepo.findOneAndUpsert$(
            leaderboardId,
            userId,
            matchId,
            predictionId,
            points!,
            hasJoker!,
          );
        }),
      )
      .pipe(count())
      .toPromise();
  }

  public updateRankings(seasonId: string) {
    return this.leaderboardRepo
      .findAll$({ season: seasonId, status: BOARD_STATUS.UPDATING_SCORES })
      .pipe(
        flatMap(leaderboards => {
          return from(leaderboards);
        }),
      )
      .pipe(
        flatMap(leaderboard => {
          return this.leaderboardRepo.findByIdAndUpdate$(leaderboard.id!, {
            status: BOARD_STATUS.UPDATING_RANKINGS,
          });
        }),
      )
      .pipe(
        flatMap(leaderboard => {
          return this.userScoreRepo
            .findByLeaderboardOrderByPoints$(leaderboard.id!)
            .pipe(
              flatMap(userScores => {
                return from(userScores);
              }),
            )
            .pipe(
              flatMap((standing, index) => {
                index += 1;
                const previousPosition = standing.positionNew || 0;
                const positionOld = previousPosition;
                const positionNew = index;
                return this.userScoreRepo
                  .findByIdAndUpdate$(standing.id!, {
                    positionNew,
                    positionOld,
                  })
                  .pipe(
                    map(_ => {
                      return leaderboard.id;
                    }),
                  );
              }),
            );
        }),
      )
      .pipe(distinct(), count())
      .toPromise();
  }

  public markLeaderboardsAsRefreshed(seasonId: string) {
    return this.leaderboardRepo
      .findAll$({ season: seasonId, status: BOARD_STATUS.UPDATING_RANKINGS })
      .pipe(
        flatMap(leaderboards => {
          return from(leaderboards);
        }),
      )
      .pipe(
        flatMap(leaderboard => {
          return this.leaderboardRepo.findByIdAndUpdate$(leaderboard.id!, {
            status: BOARD_STATUS.REFRESHED,
          });
        }),
      )
      .pipe(count())
      .toPromise();
  }
}
