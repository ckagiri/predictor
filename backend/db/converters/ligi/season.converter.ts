import { Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { SeasonModel } from '../../models/season.model';
import { SeasonConverter } from '../season.converter';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../repositories/competition.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiSeasonConverter implements SeasonConverter {
  public static getInstance(): SeasonConverter {
    return new LigiSeasonConverter(
      CompetitionRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }
  public footballApiProvider: ApiProvider;

  constructor(private competitionRepo: CompetitionRepository) {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<SeasonModel> {
    return this.competitionRepo.findById$(data.competitionId).pipe(
      flatMap(competition => {
        return of({
          ...data,
          competition: {
            id: competition.id!,
            name: competition.name,
            slug: competition.slug,
          },
        });
      }),
    );
  }
}
