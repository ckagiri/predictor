import { Observable, of, throwError, zip } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider.js';
import { getMatchStatus, Match } from '../../models/match.model.js';
import {
  GameRoundRepository,
  GameRoundRepositoryImpl,
} from '../../repositories/gameRound.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../repositories/season.repo.js';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../repositories/team.repo.js';
import { MatchConverter } from '../match.converter.js';

export class AfdMatchConverter implements MatchConverter {
  footballApiProvider: ApiProvider;
  constructor(
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private gameRoundRepo: GameRoundRepository
  ) {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  static getInstance(
    seasonRepo?: SeasonRepository,
    teamRepo?: TeamRepository,
    gameRoundRepo?: GameRoundRepository
  ): MatchConverter {
    const seasonRepoImpl =
      seasonRepo ??
      SeasonRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA);
    const teamRepoImpl =
      teamRepo ?? TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA);
    const gameRoundRepoImpl =
      gameRoundRepo ?? GameRoundRepositoryImpl.getInstance();

    return new AfdMatchConverter(
      seasonRepoImpl,
      teamRepoImpl,
      gameRoundRepoImpl
    );
  }
  from(data: any): Observable<Match> {
    return zip(
      this.seasonRepo.findByExternalId$(data.season.id),
      this.teamRepo.findByName$(data.homeTeam.shortName),
      this.teamRepo.findByName$(data.awayTeam.shortName)
    ).pipe(
      map(([season, homeTeam, awayTeam]) => {
        if (!season?.id || !homeTeam || !awayTeam) {
          throw new Error('seasonId, homeTeam or awayTeam not found');
        }
        return {
          awayTeam: {
            id: awayTeam.id,
            name: awayTeam.name,
            slug: awayTeam.slug,
            tla: awayTeam.tla!,
          },
          homeTeam: {
            id: homeTeam.id,
            name: homeTeam.name,
            slug: homeTeam.slug,
            tla: homeTeam.tla!,
          },
          season,
        };
      }),
      mergeMap(({ awayTeam, homeTeam, season }) => {
        return this.gameRoundRepo
          .findOne$({ position: data.matchday, season: season.id })
          .pipe(
            mergeMap(gameRound => {
              if (!gameRound) {
                return throwError(
                  () =>
                    new Error(
                      `Game round not found for matchday ${String(data.matchday)}`
                    )
                );
              }
              return of({
                awayTeam,
                externalReference: {
                  [this.footballApiProvider]: {
                    id: data.id,
                  },
                },
                gameRound: gameRound.id,
                homeTeam,
                matchday: data.matchday,
                odds: data.odds,
                result: {
                  goalsAwayTeam: data.score.fullTime.away,
                  goalsHomeTeam: data.score.fullTime.home,
                },
                season: season.id,
                slug: `${homeTeam.tla.toLowerCase()}-${awayTeam.tla.toLowerCase()}`,
                status: getMatchStatus(data.status.toUpperCase()),
                utcDate: data.utcDate,
              } as Match);
            })
          );
      })
    );
  }

  map(data: any[]): any[] {
    return data.map(item => item);
  }
}
