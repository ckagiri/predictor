import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import {
  CompetitionConverter,
  CompetitionConverterImpl,
} from '../converters/competition.converter.js';
import CompetitionModel, { Competition } from '../models/competition.model.js';
import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo.js';

export type CompetitionRepository = BaseFootballApiRepository<Competition>;

export class CompetitionRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Competition>
  implements CompetitionRepository
{
  constructor(converter: CompetitionConverter) {
    super(CompetitionModel, converter);
  }

  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI
  ): CompetitionRepository {
    return new CompetitionRepositoryImpl(
      CompetitionConverterImpl.getInstance(provider)
    );
  }
}
