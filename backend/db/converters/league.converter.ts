import { Observable } from 'rxjs';

import { LigiLeagueConverter } from '../converters/ligi/league.converter';
import { Converter } from './converter';
import { LeagueEntity } from '../models/league.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface LeagueConverter extends Converter {
  from(data: any): Observable<LeagueEntity>;
}

export abstract class LeagueConverterImpl {
  public static getInstance(provider: ApiProvider): LeagueConverter {
    switch (provider) {
      case ApiProvider.LIGI:
      case ApiProvider.API_FOOTBALL_DATA:
        return LigiLeagueConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
