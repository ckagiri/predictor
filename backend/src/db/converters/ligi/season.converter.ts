import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { Season } from '../../models/season.model.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../repositories/competition.repo.js';
import { SeasonConverter } from '../season.converter.js';

export class LigiSeasonConverter implements SeasonConverter {
  public footballApiProvider: ApiProvider;
  constructor(private competitionRepo: CompetitionRepository) {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public static getInstance(): SeasonConverter {
    return new LigiSeasonConverter(
      CompetitionRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA)
    );
  }

  public from(data: any): Observable<Season> {
    return this.competitionRepo.findById$(data.competitionId).pipe(
      mergeMap(competition => {
        if (!competition) {
          throw new Error('Competition not found');
        }
        return of({
          ...data,
          competition: {
            id: competition.id!,
            name: competition.name,
            slug: competition.slug,
          },
        });
      })
    );
  }
}
