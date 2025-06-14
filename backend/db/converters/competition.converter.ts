import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { LigiCompetitionConverter } from '../converters/ligi/competition.converter.js';
import { Competition } from '../models/competition.model.js';
import { Converter } from './converter.js';

export interface CompetitionConverter extends Converter {
  from(data: any): Observable<Competition>;
}

export const CompetitionConverterImpl = {
  getInstance(provider: ApiProvider): CompetitionConverter {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
      case ApiProvider.LIGI:
        return LigiCompetitionConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  },
};
