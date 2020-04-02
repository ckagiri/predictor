import { from, Observable, throwError } from 'rxjs';
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

export interface SeasonRepository extends BaseFootballApiRepository<Season> {
  getTeamsForSeason$(seasonId: string | undefined): Observable<Team[]>;
}

export class SeasonRepositoryImpl
  extends BaseFootballApiRepositoryImpl<Season, SeasonDocument>
  implements SeasonRepository {
  public static getInstance(
    provider: ApiProvider = ApiProvider.LIGI,
  ): SeasonRepository {
    return new SeasonRepositoryImpl(SeasonConverterImpl.getInstance(provider));
  }

  constructor(converter: SeasonConverter) {
    super(SeasonModel, converter);
  }

  getTeamsForSeason$(seasonId: string | undefined) {
    if (!seasonId) {
      throwError('seasonId cannot be empty');
    }
    return from(
      new Promise(
        (
          resolve: (value?: Team[]) => void,
          reject: (reason?: Error) => void,
        ) => {
          SeasonModel.findOne({ _id: seasonId })
            .populate('teams', '-__v -externalReference')
            .lean()
            .exec(function(err, season) {
              if (err) reject(err);
              if (!season)
                reject(new Error('Failed to load Season ' + seasonId));
              return resolve(season.teams as Team[]);
            });
        },
      ),
    );
  }
}
