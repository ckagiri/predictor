import { mergeMap, Observable, toArray } from 'rxjs';

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
  findAllFor$({ seasonId, gameRoundIds }:
    { seasonId: string, gameRoundIds: string[] }): Observable<Leaderboard[]>
  findAndUpdateAllFor$({ seasonId, gameRoundIds }:
    { seasonId: string, gameRoundIds: string[] }, update: any): Observable<Leaderboard[]>
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

  findAndUpdateAllFor$({ seasonId, gameRoundIds }: {
    seasonId: string, gameRoundIds: string[]
  }, update: any): Observable<Leaderboard[]> {
    return this.findAllFor$({ seasonId, gameRoundIds }).pipe(
      mergeMap(leaderboards => leaderboards),
      mergeMap(leaderboard => {
        return this.findByIdAndUpdate$(leaderboard.id!, update)
      }),
      toArray()
    );
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

  findAllFor$({ seasonId, gameRoundIds }: { seasonId: string, gameRoundIds: string[] })
    : Observable<Leaderboard[]> {
    return this.findAll$({
      $or: [
        { season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON },
        { gameRound: { $in: gameRoundIds }, boardType: BOARD_TYPE.GLOBAL_ROUND }
      ]
    })
  }
}
