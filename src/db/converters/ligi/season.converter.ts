import { Observable, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { ISeason } from "../../models/season.model";
import { ISeasonConverter } from "../season.converter";
import {
  ILeagueRepository,
  LeagueRepository
} from "../../repositories/league.repo";
import { FootballApiProvider as ApiProvider } from "../../../common/footballApiProvider";

export class SeasonConverter implements ISeasonConverter {
  static getInstance(): ISeasonConverter {
    return new SeasonConverter(
      LeagueRepository.getInstance(ApiProvider.API_FOOTBALL_DATA)
    );
  }
  provider: ApiProvider;

  constructor(private leagueRepo: ILeagueRepository) {
    this.provider = ApiProvider.API_FOOTBALL_DATA;
  }

  from(data: any): Observable<ISeason> {
    return this.leagueRepo.findById$(data.leagueId).pipe(
      flatMap(league => {
        return of({
          ...data,
          league: {
            id: league._id,
            name: league.name,
            slug: league.slug
          }
        });
      })
    );
  }
}
