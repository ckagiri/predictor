import { Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { SeasonEntity } from '../../models/season.model';
import { SeasonConverter } from '../season.converter';
import {
  LeagueRepository,
  LeagueRepositoryImpl,
} from '../../repositories/league.repo';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';

export class LigiSeasonConverter implements SeasonConverter {
  public static getInstance(): SeasonConverter {
    return new LigiSeasonConverter(
      LeagueRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA),
    );
  }
  public provider: ApiProvider;

  constructor(private leagueRepo: LeagueRepository) {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<SeasonEntity> {
    return this.leagueRepo.findById$(data.leagueId).pipe(
      flatMap(league => {
        return of({
          ...data,
          league: {
            id: league.id!,
            name: league.name,
            slug: league.slug,
          },
        });
      }),
    );
  }
}
