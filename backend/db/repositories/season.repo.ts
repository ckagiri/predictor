import { SeasonEntity, SeasonDocument, Season } from '../models/season.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  SeasonConverter,
  SeasonConverterImpl,
} from '../converters/season.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface SeasonRepository
  extends BaseFootballApiRepository<SeasonEntity> { }

export class SeasonRepositoryImpl
  extends BaseFootballApiRepositoryImpl<SeasonEntity, SeasonDocument>
  implements SeasonRepository {
  public static getInstance(provider: ApiProvider): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverterImpl.getInstance(provider));
  }

  constructor(converter: SeasonConverter) {
    super(Season, converter);
  }
}
