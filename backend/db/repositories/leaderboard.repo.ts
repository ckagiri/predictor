import { Observable } from 'rxjs';

import LeaderboardModel, {
  Leaderboard,
  LeaderboardDocument,
  BOARD_TYPE,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface LeaderboardRepository
  extends BaseRepository<Leaderboard> {
  findSeasonBoardAndUpsert$(
    seasonId: string,
    update: any,
  ): Observable<Leaderboard>;
  findMonthBoardAndUpsert$(
    seasonId: string,
    year: number,
    month: number,
    update: any,
  ): Observable<Leaderboard>;
  findRoundBoardAndUpsert$(
    seasonId: string,
    gameRound: number,
    update: any,
  ): Observable<Leaderboard>;
}

export class LeaderboardRepositoryImpl
  extends BaseRepositoryImpl<Leaderboard, LeaderboardDocument>
  implements LeaderboardRepository {
  public static getInstance() {
    return new LeaderboardRepositoryImpl();
  }

  constructor() {
    super(LeaderboardModel);
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
