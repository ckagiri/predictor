import GameRoundModel, {
  GameRound
} from '../models/gameRound.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface GameRoundRepository extends BaseRepository<GameRound> {
}
export class GameRoundRepositoryImpl extends BaseRepositoryImpl<GameRound>
  implements GameRoundRepository {

  public static getInstance(): GameRoundRepository {
    return new GameRoundRepositoryImpl();
  }

  constructor() {
    super(GameRoundModel);
  }
}
