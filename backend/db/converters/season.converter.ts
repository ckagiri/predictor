import { Observable } from 'rxjs';

import { LigiSeasonConverter } from '../converters/ligi/season.converter';
import { AfdSeasonConverter } from '../converters/apiFootballData/season.converter';
import { Converter } from './converter';
import { SeasonModel } from '../models/season.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface SeasonConverter extends Converter {
  from(data: any): Observable<SeasonModel>;
}

export abstract class SeasonConverterImpl {
  public static getInstance(provider: ApiProvider): SeasonConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiSeasonConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdSeasonConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
