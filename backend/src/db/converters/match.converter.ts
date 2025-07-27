import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { AfdMatchConverter } from './apiFootballData/match.converter.js';
import { LigiMatchConverter } from './ligi/match.converter.js';
import { Match } from '../models/match.model.js';
import { Converter } from './converter.js';

export interface MatchConverter extends Converter {
  from(data: any): Observable<Match>;
  map(data: any[]): any[];
}

export const MatchConverterImpl = {
  getInstance(provider: ApiProvider): MatchConverter {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdMatchConverter.getInstance();
      case ApiProvider.LIGI:
        return LigiMatchConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  },
};
