import { EMPTY, mergeMap, Observable, of, throwIfEmpty, toArray } from 'rxjs';

import LeaderboardModel, {
  BOARD_TYPE,
  Leaderboard,
} from '../models/leaderboard.model.js';
import { BaseRepository, BaseRepositoryImpl } from './base.repo.js';

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findAllGlobalFor$({
    gameRoundIds,
    seasonId,
  }: SeasonOrRoundsQuery): Observable<Leaderboard[]>;
  findByIdAndUpdateMatches$(
    leaderboardId: string,
    matchIds: string[]
  ): Observable<Leaderboard>;
  findOrCreateRoundLeaderboard$(
    seasonId: string,
    gameRoundId: string
  ): Observable<Leaderboard>;
  findOrCreateSeasonLeaderboard$(seasonId: string): Observable<Leaderboard>;
  findRoundLeaderboard$(
    seasonId: string,
    gameRoundId: string
  ): Observable<Leaderboard | null>;
  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard | null>;
}

interface SeasonOrRoundsQuery {
  gameRoundIds: string[];
  seasonId: string;
}

export class LeaderboardRepositoryImpl
  extends BaseRepositoryImpl<Leaderboard>
  implements LeaderboardRepository
{
  constructor() {
    super(LeaderboardModel);
  }

  static getInstance() {
    return new LeaderboardRepositoryImpl();
  }

  findAllGlobalFor$({
    gameRoundIds,
    seasonId,
  }: SeasonOrRoundsQuery): Observable<Leaderboard[]> {
    return this.findAll$({
      $or: [
        { boardType: BOARD_TYPE.GLOBAL_SEASON, season: seasonId },
        {
          boardType: BOARD_TYPE.GLOBAL_ROUND,
          gameRound: { $in: gameRoundIds },
        },
      ],
    });
  }

  findByIdAndUpdateMatches$(
    leaderboardId: string,
    matchIds: string[]
  ): Observable<Leaderboard> {
    return this.findByIdAndUpdate$(leaderboardId, {
      $addToSet: { matches: { $each: matchIds } },
    }).pipe(
      mergeMap(p => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new Error(`leaderboard:${leaderboardId}`))
    );
  }

  findOrCreateRoundLeaderboard$(
    seasonId: string,
    gameRoundId: string
  ): Observable<Leaderboard> {
    return this.findOneOrCreate$({
      boardType: BOARD_TYPE.GLOBAL_ROUND,
      gameRound: gameRoundId,
      season: seasonId,
    });
  }

  findOrCreateSeasonLeaderboard$(seasonId: string): Observable<Leaderboard> {
    return this.findOneOrCreate$({
      boardType: BOARD_TYPE.GLOBAL_SEASON,
      season: seasonId,
    });
  }

  findRoundLeaderboard$(
    seasonId: string,
    gameRoundId: string
  ): Observable<Leaderboard | null> {
    return this.findOne$({
      boardType: BOARD_TYPE.GLOBAL_ROUND,
      gameRound: gameRoundId,
      season: seasonId,
    });
  }

  findSeasonLeaderboard$(seasonId: string): Observable<Leaderboard | null> {
    return this.findOne$({
      boardType: BOARD_TYPE.GLOBAL_SEASON,
      season: seasonId,
    });
  }
}
