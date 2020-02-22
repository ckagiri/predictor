import { from, Observable, forkJoin } from 'rxjs';
import {
  concatMap,
  count,
  distinct,
  filter,
  flatMap,
  map,
} from 'rxjs/operators';

import { IFixture, FixtureStatus } from '../../db/models/fixture.model';
import {
  IUserRepository,
  UserRepository,
} from '../../db/repositories/user.repo';
import { BOARD_STATUS, ILeaderboard } from '../../db/models/leaderboard.model';
import {
  ILeaderboardRepository,
  LeaderboardRepository,
} from '../../db/repositories/leaderboard.repo';
import {
  IPredictionRepository,
  PredictionRepository,
} from '../../db/repositories/prediction.repo';
import {
  IUserScoreRepository,
  UserScoreRepository,
} from '../../db/repositories/userScore.repo';
import {
  ICacheService,
  CacheService,
} from '../../common/observableCacheService';

export interface ILeaderboardUpdater {
  updateScores(fixtures: IFixture[]): Promise<number>;
  updateRankings(seasonId: string): Promise<number>;
  markLeaderboardsAsRefreshed(seasonId: string): Promise<number>;
}

export class LeaderboardUpdater implements ILeaderboardUpdater {
  public static getInstance() {
    return new LeaderboardUpdater(
      UserRepository.getInstance(),
      LeaderboardRepository.getInstance(),
      PredictionRepository.getInstance(),
      UserScoreRepository.getInstance(),
    ).setCacheService(new CacheService());
  }

  private cacheService: ICacheService | undefined;

  constructor(
    private userRepo: IUserRepository,
    private leaderboardRepo: ILeaderboardRepository,
    private predictionRepo: IPredictionRepository,
    private userScoreRepo: IUserScoreRepository,
  ) {}

  public setCacheService(cacheService: ICacheService) {
    this.cacheService = cacheService;
    return this;
  }

  public updateScores(fixtures: IFixture[]) {
    if (this.cacheService != null) {
      this.cacheService.clear();
    }
    return from(fixtures)
      .pipe(
        filter(fixture => {
          return (
            fixture.status === FixtureStatus.FINISHED &&
            fixture.allPredictionsProcessed === false
          );
        }),
      )
      .pipe(
        flatMap(fixture => {
          return this.userRepo
            .findAll$()
            .pipe(
              flatMap(users => {
                return from(users);
              }),
            )
            .pipe(
              map(user => {
                return { user, fixture };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const { user, fixture } = data;
          const { season, gameRound, date } = fixture;
          const month = date.getUTCMonth() + 1;
          const year = date.getFullYear();

          const boards: Array<Observable<ILeaderboard>> = [];
          let sBoard: Observable<ILeaderboard>;
          let mBoard: Observable<ILeaderboard>;
          let rBoard: Observable<ILeaderboard>;

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
                return { user, fixture, leaderboard };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const { user, fixture, leaderboard } = data;
          return this.predictionRepo
            .findOne$({ userId: user.id, fixtureId: fixture.id })
            .pipe(
              map(prediction => {
                return { user, fixture, leaderboard, prediction };
              }),
            );
        }),
      )
      .pipe(
        concatMap(data => {
          const { user, fixture, leaderboard, prediction } = data;
          const userId = user.id!;
          const fixtureId = fixture.id!;
          const leaderboardId = leaderboard.id!;
          const predictionId = prediction.id!;
          const { scorePoints: points, hasJoker } = prediction;
          return this.userScoreRepo.findOneAndUpsert$(
            leaderboardId,
            userId,
            fixtureId,
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
