import { Observable } from 'rxjs';

import { LeagueConverter as LigiLeagueConverter } from '../converters/ligi/league.converter';
import { Converter } from './converter';
import { LeagueEntity } from '../models/league.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface ILeagueConverter extends Converter {
  from(data: any): Observable<LeagueEntity>;
}

export abstract class LeagueConverter {
  public static getInstance(provider: ApiProvider): ILeagueConverter {
    switch (provider) {
      case ApiProvider.LIGI:
      case ApiProvider.API_FOOTBALL_DATA:
        return LigiLeagueConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
