import { mergeMap, Observable, toArray } from 'rxjs';

import LeaderboardModel, {
  BOARD_TYPE,
  Leaderboard,
  LeaderboardDocument,
} from '../models/leaderboard.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

type SeasonOrRoundsQuery = { seasonId: string, gameRoundIds: string[] };

export interface LeaderboardRepository extends BaseRepository<Leaderboard> {
  findOrCreateSeasonLeaderboardAndUpdate$(
    seasonId: string, update: any
  ): Observable<Leaderboard>;
  findOrCreateRoundLeaderboardAndUpdate$(
    seasonId: string, gameRoundId: string, update: any
  ): Observable<Leaderboard>;
  findSeasonLeaderboardAndUpdate$(
    seasonId: string, update: any
  ): Observable<Leaderboard>;
  findRoundLeaderboardAndUpdate$(
    seasonId: string, gameRoundId: string, update: any
  ): Observable<Leaderboard>;
  findAllFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery): Observable<Leaderboard[]>
  findAndUpdateAllFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery, update: any): Observable<Leaderboard[]>
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
    return this.findOneAndUpsert$({
      season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON
    }, update)
  }

  findOrCreateRoundLeaderboardAndUpdate$(seasonId: string, gameRoundId: string, update: any)
    : Observable<Leaderboard> {
    return this.findOneAndUpsert$({
      season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND
    }, update)
  }

  findSeasonLeaderboardAndUpdate$(seasonId: string, update: any): Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON
    }, update)
  }

  findRoundLeaderboardAndUpdate$(seasonId: string, gameRoundId: string, update: any):
    Observable<Leaderboard> {
    return this.findOneAndUpdate$({
      season: seasonId, gameRound: gameRoundId, boardType: BOARD_TYPE.GLOBAL_ROUND
    }, update)
  }

  findAllFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery): Observable<Leaderboard[]> {
    return this.findAll$({
      $or: [
        { season: seasonId, boardType: BOARD_TYPE.GLOBAL_SEASON },
        { gameRound: { $in: gameRoundIds }, boardType: BOARD_TYPE.GLOBAL_ROUND }
      ]
    })
  }

  findAndUpdateAllFor$({ seasonId, gameRoundIds }: SeasonOrRoundsQuery, update: any):
    Observable<Leaderboard[]> {
    return this.findAllFor$({ seasonId, gameRoundIds }).pipe(
      mergeMap(leaderboards => leaderboards),
      mergeMap(leaderboard => {
        return this.findByIdAndUpdate$(leaderboard.id!, update)
      }),
      toArray()
    );
  }
}
