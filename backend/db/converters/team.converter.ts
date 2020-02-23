import { Observable } from 'rxjs';

import { LigiTeamConverter } from '../converters/ligi/team.converter';
import { AfdTeamConverter } from '../converters/apiFootballData/team.converter';
import { Converter } from './converter';
import { TeamEntity } from '../models/team.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface TeamConverter extends Converter {
  from(data: any): Observable<TeamEntity>;
}

export abstract class TeamConverterImpl {
  public static getInstance(provider: ApiProvider): TeamConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiTeamConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdTeamConverter.getInstance();
      default:
        throw new Error('Converter for Provider does not exist');
    }
  }
}
