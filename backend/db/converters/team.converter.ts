import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { AfdTeamConverter } from '../converters/apiFootballData/team.converter.js';
import { LigiTeamConverter } from '../converters/ligi/team.converter.js';
import { Team } from '../models/team.model.js';
import { Converter } from './converter.js';

export interface TeamConverter extends Converter {
  from(data: any): Observable<Team>;
}

export const TeamConverterImpl = {
  getInstance(provider: ApiProvider): TeamConverter {
    switch (provider) {
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdTeamConverter.getInstance();
      case ApiProvider.LIGI:
        return LigiTeamConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  },
};
