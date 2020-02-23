import { Observable } from 'rxjs';

import {
  LeaderboardEntity,
  Leaderboard,
  LeaderboardDocument,
  BOARD_TYPE,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface LeaderboardRepository
  extends BaseRepository<LeaderboardEntity> {
  findSeasonBoardAndUpsert$(
    seasonId: string,
    update: any,
  ): Observable<LeaderboardEntity>;
  findMonthBoardAndUpsert$(
    seasonId: string,
    year: number,
    month: number,
    update: any,
  ): Observable<LeaderboardEntity>;
  findRoundBoardAndUpsert$(
    seasonId: string,
    gameRound: number,
    update: any,
  ): Observable<LeaderboardEntity>;
}

export class LeaderboardRepositoryImpl
  extends BaseRepositoryImpl<LeaderboardEntity, LeaderboardDocument>
  implements LeaderboardRepository {
  public static getInstance() {
    return new LeaderboardRepositoryImpl();
  }

  constructor() {
    super(Leaderboard);
  }

  public findSeasonBoardAndUpsert$(seasonId: string, update: any) {
    const query: any = {
      season: seasonId,
      boardType: BOARD_TYPE.GLOBAL_SEASON,
    };
    return this.findOneAndUpdate$(query, update, { upsert: true, new: true });
  }

  public findMonthBoardAndUpsert$(
    seasonId: string,
    year: number,
    month: number,
    update: any,
  ) {
    const query: any = {
      season: seasonId,
      year,
      month,
      boardType: BOARD_TYPE.GLOBAL_MONTH,
    };
    return this.findOneAndUpdate$(query, update, { upsert: true, new: true });
  }

  public findRoundBoardAndUpsert$(
    seasonId: string,
    gameRound: number,
    update: any,
  ) {
    const query: any = {
      season: seasonId,
      gameRound,
      boardType: BOARD_TYPE.GLOBAL_ROUND,
    };
    return this.findOneAndUpdate$(query, update, { upsert: true, new: true });
  }
}
