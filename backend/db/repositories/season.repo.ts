import { SeasonEntity, SeasonDocument, Season } from '../models/season.model';
import {
  BaseProviderRepository,
  BaseProviderRepositoryImpl,
} from './baseProvider.repo';
import {
  ISeasonConverter,
  SeasonConverter,
} from '../converters/season.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface SeasonRepository extends BaseProviderRepository<SeasonEntity> { }

export class SeasonRepositoryImpl
  extends BaseProviderRepositoryImpl<SeasonEntity, SeasonDocument>
  implements SeasonRepository {
  public static getInstance(provider: ApiProvider): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverter.getInstance(provider));
  }

  constructor(converter: ISeasonConverter) {
    super(Season, converter);
  }
}
