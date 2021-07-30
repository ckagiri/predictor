import { Observable, of } from 'rxjs';

import { GameRound } from '../../models/gameRound.model';
import { GameRoundConverter } from '../gameRound.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiGameRoundConverter implements GameRoundConverter {
  public static getInstance(): GameRoundConverter {
    return new LigiGameRoundConverter();
  }
  public footballApiProvider: ApiProvider;

  constructor() {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<GameRound> {
    return of({
      ...data,
    });
  }
}
