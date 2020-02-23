import { Observable } from 'rxjs';

import { LigiMatchConverter } from '../converters/ligi/match.converter';
import { AfdMatchConverter } from '../converters/apiFootballData/match.converter';
import { Converter } from './converter';
import { MatchEntity } from '../models/match.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface MatchConverter extends Converter {
  from(data: any): Observable<MatchEntity>;
  map(data: any[]): any[];
}

export abstract class MatchConverterImpl {
  public static getInstance(provider: ApiProvider): MatchConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiMatchConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdMatchConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
