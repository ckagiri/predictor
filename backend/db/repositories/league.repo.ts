import { LeagueEntity, LeagueDocument, League } from '../models/league.model';
import {
  BaseProviderRepository,
  BaseProviderRepositoryImpl,
} from './baseProvider.repo';
import {
  LeagueConverter,
  LeagueConverterImpl,
} from '../converters/league.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface LeagueRepository extends BaseProviderRepository<LeagueEntity> { }

export class LeagueRepositoryImpl
  extends BaseProviderRepositoryImpl<LeagueEntity, LeagueDocument>
  implements LeagueRepository {
  public static getInstance(provider: ApiProvider): LeagueRepository {
    return new LeagueRepositoryImpl(LeagueConverterImpl.getInstance(provider));
  }

  constructor(converter: LeagueConverter) {
    super(League, converter);
  }
}
