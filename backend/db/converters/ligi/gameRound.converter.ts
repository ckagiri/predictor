import { Observable, of } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { GameRound } from '../../models/gameRound.model.js';
import { GameRoundConverter } from '../gameRound.converter.js';

export class LigiGameRoundConverter implements GameRoundConverter {
  public footballApiProvider: ApiProvider;
  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public static getInstance(): GameRoundConverter {
    return new LigiGameRoundConverter();
  }

  public from(data: any): Observable<GameRound> {
    return of({
      ...data,
    });
  }
}
