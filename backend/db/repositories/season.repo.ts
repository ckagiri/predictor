import { mergeMap, Observable } from 'rxjs';
import SeasonModel, { Season, SeasonDocument } from '../models/season.model';
import { Team } from '../models/team.model';

import {
  BaseFootballApiRepository,
  BaseFootballApiRepositoryImpl,
} from './baseFootballApi.repo';
import {
  SeasonConverter,
  SeasonConverterImpl,
} from '../converters/season.converter';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { TeamRepository, TeamRepositoryImpl } from './team.repo';

export interface SeasonRepository extends BaseFootballApiRepository<Season> {
  getTeamsForSeason$(seasonId: string): Observable<Team[]>;
}

export class SeasonRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Season, SeasonDocument>
  implements SeasonRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
    teamRepo: TeamRepository = TeamRepositoryImpl.getInstance()
  ): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverterImpl.getInstance(provider), teamRepo);
  }

  constructor(converter: SeasonConverter, private teamRepo: TeamRepository) {
    super(SeasonModel, converter);
  }

  public getTeamsForSeason$(seasonId: string): Observable<Team[]> {
    return this.findById$(seasonId)
      .pipe(
        mergeMap(({ teams }) => {
          return this.teamRepo.findAll$({
            _id: { $in: teams }
          })
        })
      )
  }
}
