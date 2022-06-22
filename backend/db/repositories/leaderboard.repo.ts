import { Observable } from 'rxjs';

import LeaderboardModel, {
  BOARD_TYPE,
  Leaderboard,
  LeaderboardDocument,
  STATUS,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findOrCreateSeasonLeaderboardAndUpdate$(
    seasonId: string, update: any): Observable<Leaderboard>;
  findOrCreateRoundLeaderboardAndUpdate$(
    seasonId: string,
    gameRoundId: string,
    update: any): Observable<Leaderboard>;
  findAllFor$(
    { seasonId, gameRoundId }: { seasonId: string, gameRoundId?: string }
  ): Observable<Leaderboard[]>
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

  findOrCreateSeasonLeaderboardAndUpdate$(seasonId: string, update: any)
    : Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON
    }, update, { upsert: true, new: true })
  }

  findOrCreateRoundLeaderboardAndUpdate$(seasonId: string, gameRoundId: string, update: any)
    : Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND
    }, update, { upsert: true, new: true })
  }

  findAllFor$({ seasonId, gameRoundId }: { seasonId: string, gameRoundId?: string })
    : Observable<Leaderboard[]> {
    return this.findAll$({
      $or: [
        { $and: [{ season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON }] },
        { $and: [{ season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND }] }
      ]
    })
  }
}
