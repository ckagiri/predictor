import { Observable } from 'rxjs';

import { LigiGameRoundConverter } from '../converters/ligi/gameRound.converter';
import { Converter } from './converter';
import { GameRound } from '../models/gameRound.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface GameRoundConverter extends Converter {
  from(data: any): Observable<GameRound>;
}

export abstract class GameRoundConverterImpl {
  public static getInstance(provider: ApiProvider): GameRoundConverter {
    switch (provider) {
      case ApiProvider.LIGI:
      case ApiProvider.API_FOOTBALL_DATA:
        return LigiGameRoundConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
