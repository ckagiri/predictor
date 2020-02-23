import { Observable } from 'rxjs';

import { LigiFixtureConverter } from '../converters/ligi/fixture.converter';
import { AfdFixtureConverter } from '../converters/apiFootballData/fixture.converter';
import { Converter } from './converter';
import { FixtureEntity } from '../models/fixture.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface FixtureConverter extends Converter {
  from(data: any): Observable<FixtureEntity>;
  map(data: any[]): any[];
}

export abstract class FixtureConverterImpl {
  public static getInstance(provider: ApiProvider): FixtureConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiFixtureConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdFixtureConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
