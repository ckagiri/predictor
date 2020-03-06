import { Observable } from 'rxjs';

import { LigiCompetitionConverter } from '../converters/ligi/competition.converter';
import { Converter } from './converter';
import { Competition } from '../models/competition.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface CompetitionConverter extends Converter {
  from(data: any): Observable<Competition>;
}

export abstract class CompetitionConverterImpl {
  public static getInstance(provider: ApiProvider): CompetitionConverter {
    switch (provider) {
      case ApiProvider.LIGI:
      case ApiProvider.API_FOOTBALL_DATA:
        return LigiCompetitionConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
