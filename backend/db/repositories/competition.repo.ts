import CompetitionModel, {
  Competition
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
  extends BaseFootballApiRepository<Competition> { }

export class CompetitionRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Competition>
  implements CompetitionRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): CompetitionRepository {
    return new CompetitionRepositoryImpl(
      CompetitionConverterImpl.getInstance(provider),
    );
  }

  constructor(converter: CompetitionConverter) {
    super(CompetitionModel, converter);
  }
}
