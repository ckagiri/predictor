import GameRoundModel, { GameRound } from '../models/gameRound.model.js';
import { BaseRepository, BaseRepositoryImpl } from './base.repo.js';

export type GameRoundRepository = BaseRepository<GameRound>;
export class GameRoundRepositoryImpl
  extends BaseRepositoryImpl<GameRound>
  implements GameRoundRepository
{
  constructor() {
    super(GameRoundModel);
  }

  static getInstance(): GameRoundRepository {
    return new GameRoundRepositoryImpl();
  }
}
