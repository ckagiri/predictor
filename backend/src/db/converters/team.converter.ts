import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { Team } from '../models/team.model.js';
import { AfdTeamConverter } from './apiFootballData/team.converter.js';
import { Converter } from './converter.js';
import { LigiTeamConverter } from './ligi/team.converter.js';

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
