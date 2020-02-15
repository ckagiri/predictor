import { ISeason, ISeasonDocument, Season } from '../models/season.model';
import {
  IBaseProviderRepository,
  BaseProviderRepository,
} from './baseProvider.repo';
import {
  ISeasonConverter,
  SeasonConverter,
} from '../converters/season.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface ISeasonRepository extends IBaseProviderRepository<ISeason> {}

export class SeasonRepository
  extends BaseProviderRepository<ISeason, ISeasonDocument>
  implements ISeasonRepository {
  public static getInstance(provider: ApiProvider): ISeasonRepository {
    return new SeasonRepository(SeasonConverter.getInstance(provider));
  }

  constructor(converter: ISeasonConverter) {
    super(Season, converter);
  }
}
