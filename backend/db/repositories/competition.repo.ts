import {
  CompetitionEntity,
  CompetitionDocument,
  Competition,
} from '../models/competition.model';
import {
  BaseProviderRepository,
  BaseProviderRepositoryImpl,
} from './baseProvider.repo';
import {
  CompetitionConverter,
  CompetitionConverterImpl,
} from '../converters/competition.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface CompetitionRepository
  extends BaseProviderRepository<CompetitionEntity> {}

export class CompetitionRepositoryImpl
  extends BaseProviderRepositoryImpl<CompetitionEntity, CompetitionDocument>
  implements CompetitionRepository {
  public static getInstance(provider: ApiProvider): CompetitionRepository {
    return new CompetitionRepositoryImpl(
      CompetitionConverterImpl.getInstance(provider),
    );
  }

  constructor(converter: CompetitionConverter) {
    super(Competition, converter);
  }
}
