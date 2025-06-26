import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import {
  SeasonConverter,
  SeasonConverterImpl,
} from '../converters/season.converter.js';
import SeasonModel, { Season } from '../models/season.model.js';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo.js';

export type SeasonRepository = BaseFootballApiRepository<Season>;
export class SeasonRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Season>
  implements SeasonRepository
{
  constructor(converter: SeasonConverter) {
    super(SeasonModel, converter);
  }

  static getInstance(
    provider: ApiProvider = ApiProvider.LIGI
  ): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverterImpl.getInstance(provider));
  }
}
