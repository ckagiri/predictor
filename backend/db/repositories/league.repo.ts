import { LeagueEntity, LeagueDocument, League } from '../models/league.model';
import {
  BaseProviderRepository,
  BaseProviderRepositoryImpl,
} from './baseProvider.repo';
import {
  ILeagueConverter,
  LeagueConverter,
} from '../converters/league.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface ILeagueRepository extends BaseProviderRepository<LeagueEntity> { }

export class LeagueRepository
  extends BaseProviderRepositoryImpl<LeagueEntity, LeagueDocument>
  implements ILeagueRepository {
  public static getInstance(provider: ApiProvider): ILeagueRepository {
    return new LeagueRepository(LeagueConverter.getInstance(provider));
  }

  constructor(converter: ILeagueConverter) {
    super(League, converter);
  }
}
