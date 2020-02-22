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

export interface ISeasonRepository extends BaseProviderRepository<SeasonEntity> { }

export class SeasonRepository
  extends BaseProviderRepositoryImpl<SeasonEntity, SeasonDocument>
  implements ISeasonRepository {
  public static getInstance(provider: ApiProvider): ISeasonRepository {
    return new SeasonRepository(SeasonConverter.getInstance(provider));
  }

  constructor(converter: ISeasonConverter) {
    super(Season, converter);
  }
}
