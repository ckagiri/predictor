import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { AfdSeasonConverter } from './apiFootballData/season.converter.js';
import { LigiSeasonConverter } from './ligi/season.converter.js';
import { Season } from '../models/season.model.js';
import { Converter } from './converter.js';

export interface SeasonConverter extends Converter {
  from(data: any): Observable<Season>;
}

export const SeasonConverterImpl = {
  getInstance(provider: ApiProvider): SeasonConverter {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdSeasonConverter.getInstance();
      case ApiProvider.LIGI:
        return LigiSeasonConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  },
};
