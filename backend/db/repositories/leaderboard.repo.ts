import { Observable } from 'rxjs';

import LeaderboardModel, {
  Leaderboard,
  LeaderboardDocument,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findSeasonLeaderboard(seasonId: string): Observable<Leaderboard>;
  findSeasonLeaderboardOrCreate(seasonId: string): Observable<Leaderboard>;
  findRoundLeaderboard(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
  findRoundLeaderboardOrCreate(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
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

  findSeasonLeaderboard(seasonId: string): Observable<Leaderboard> {
    throw new Error('Method not implemented.');
  }
  findSeasonLeaderboardOrCreate(seasonId: string): Observable<Leaderboard> {
    throw new Error('Method not implemented.');
  }
  findRoundLeaderboard(seasonId: string, gameRoundId: string): Observable<Leaderboard> {
    throw new Error('Method not implemented.');
  }
  findRoundLeaderboardOrCreate(seasonId: string, gameRoundId: string): Observable<Leaderboard> {
    throw new Error('Method not implemented.');
  }
}
