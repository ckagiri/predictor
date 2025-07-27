import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { LigiGameRoundConverter } from './ligi/gameRound.converter.js';
import { GameRound } from '../models/gameRound.model.js';
import { Converter } from './converter.js';

export interface GameRoundConverter extends Converter {
  from(data: any): Observable<GameRound>;
}

export const GameRoundConverterImpl = {
  getInstance(provider: ApiProvider): GameRoundConverter {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
      case ApiProvider.LIGI:
        return LigiGameRoundConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  },
};
