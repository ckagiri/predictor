import { Observable } from 'rxjs';

import LeaderboardModel, {
  BOARD_TYPE,
  Leaderboard,
  LeaderboardDocument,
  STATUS,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard>;
  findSeasonLeaderboardOrCreate$(seasonId: string): Observable<Leaderboard>;
  findRoundLeaderboard$(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
  findRoundLeaderboardOrCreate$(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
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

  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard> {
    return this.findOne$({ season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON })
  }

  findSeasonLeaderboardOrCreate$(seasonId: string): Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON
    }, { status: STATUS.UPDATING }, { upsert: true, new: true })
  }

  findRoundLeaderboard$(seasonId: string, gameRoundId: string): Observable<Leaderboard> {
    return this.findOne$({ season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND })
  }

  findRoundLeaderboardOrCreate$(seasonId: string, gameRoundId: string): Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND
    }, { status: STATUS.UPDATING }, { upsert: true, new: true })
  }
}
