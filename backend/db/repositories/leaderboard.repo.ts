import { mergeMap, Observable, toArray } from 'rxjs';

import LeaderboardModel, {
  BOARD_TYPE,
  Leaderboard,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

type SeasonOrRoundsQuery = { seasonId: string, gameRoundIds: string[] };

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findOrCreateSeasonLeaderboard$(seasonId: string): Observable<Leaderboard>;
  findOrCreateRoundLeaderboard$(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard>;
  findRoundLeaderboard$(seasonId: string, gameRoundId: string): Observable<Leaderboard>;
  findAllGlobalFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery): Observable<Leaderboard[]>;
  findByIdAndUpdateMatches$(leaderboardId: string, matchIds: string[]): Observable<Leaderboard>;
}

export class LeaderboardRepositoryImpl
  extends BaseRepositoryImpl<Leaderboard>
  implements LeaderboardRepository {
  public static getInstance() {
    return new LeaderboardRepositoryImpl();
  }

  constructor() {
    super(LeaderboardModel);
  }

  findByIdAndUpdateMatches$(leaderboardId: string, matchIds: string[]): Observable<Leaderboard> {
    return this.findByIdAndUpdate$(leaderboardId, { $addToSet: { matches: { $each: matchIds } } })
  }

  findOrCreateSeasonLeaderboard$(seasonId: string)
    : Observable<Leaderboard> {
    return this.findOneOrCreate$({ season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON })
  }

  findOrCreateRoundLeaderboard$(seasonId: string, gameRoundId: string)
    : Observable<Leaderboard> {
    return this.findOneOrCreate$({ season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND })
  }

  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard> {
    return this.findOne$({ season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON })
  }

  findRoundLeaderboard$(seasonId: string, gameRoundId: string): Observable<Leaderboard> {
    return this.findOne$({ season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND })
  }

  findAllGlobalFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery): Observable<Leaderboard[]> {
    return this.findAll$({
      $or: [
        { season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON },
        { gameRound: { $in: gameRoundIds }, boardType: BOARD_TYPE.GLOBAL_ROUND }
      ]
    })
  }
}
