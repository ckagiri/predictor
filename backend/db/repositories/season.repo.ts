import SeasonModel, { Season, SeasonDocument } from '../models/season.model';

import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  SeasonConverter,
  SeasonConverterImpl,
} from '../converters/season.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface SeasonRepository extends BaseFootballApiRepository<Season> {
}
export class SeasonRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Season, SeasonDocument>
  implements SeasonRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI
  ): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverterImpl.getInstance(provider));
  }

  constructor(converter: SeasonConverter) {
    super(SeasonModel, converter);
  }
}
