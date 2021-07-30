import GameRoundModel, {
  GameRound,
  GameRoundDocument,
} from '../models/gameRound.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  GameRoundConverter,
  GameRoundConverterImpl,
} from '../converters/gameRound.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface GameRoundRepository
  extends BaseFootballApiRepository<GameRound> {}

export class GameRoundRepositoryImpl
  extends BaseFootballApiRepositoryImpl<GameRound, GameRoundDocument>
  implements GameRoundRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): GameRoundRepository {
    return new GameRoundRepositoryImpl(
      GameRoundConverterImpl.getInstance(provider),
    );
  }

  constructor(converter: GameRoundConverter) {
    super(GameRoundModel, converter);
  }
}
