import {
  CompetitionEntity,
  CompetitionDocument,
  Competition,
} from '../models/competition.model';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  CompetitionConverter,
  CompetitionConverterImpl,
} from '../converters/competition.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface CompetitionRepository
  extends BaseFootballApiRepository<CompetitionEntity> { }

export class CompetitionRepositoryImpl
  extends BaseFootballApiRepositoryImpl<CompetitionEntity, CompetitionDocument>
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
