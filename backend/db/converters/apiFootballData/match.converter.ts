import { Observable, zip } from 'rxjs';

import { MatchConverter } from '../match.converter';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../repositories/season.repo';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../repositories/team.repo';

import { Match, getMatchStatus } from '../../models/match.model';
import { Season } from '../../models/season.model';
import { Team } from '../../models/team.model';
import { GameRound } from '../../models/gameRound.model';
import { GameRoundRepository, GameRoundRepositoryImpl } from '../../repositories/gameRound.repo';

export class AfdMatchConverter implements MatchConverter {
  public static getInstance(seasonRepo?: SeasonRepository, teamRepo?: TeamRepository, gameRoundRepo?: GameRoundRepository)
    : MatchConverter {
    const seasonRepoImpl = seasonRepo ?? SeasonRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA);
    const teamRepoImpl = teamRepo ?? TeamRepositoryImpl.getInstance(ApiProvider.API_FOOTBALL_DATA);
    const gameRoundRepoImpl = gameRoundRepo ?? GameRoundRepositoryImpl.getInstance();

    return new AfdMatchConverter(seasonRepoImpl, teamRepoImpl, gameRoundRepoImpl);
  }
  public footballApiProvider: ApiProvider;

  constructor(
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository,
    private gameRoundRepo: GameRoundRepository,
  ) {
    this.footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  }

  public from(data: any): Observable<Match> {
    return zip(
      this.seasonRepo.findByExternalId$(data.season.id),
      this.teamRepo.findByName$(data.homeTeam.shortName),
      this.teamRepo.findByName$(data.awayTeam.shortName),
      this.gameRoundRepo.findOne$({ position: data.matchday }),
      (season: Season, homeTeam: Team, awayTeam: Team, gameRound: GameRound) => {
        return {
          season: season.id!,
          matchday: data.matchday,
          gameRound: gameRound.id!,
          status: getMatchStatus(data.status.toUpperCase()),
          homeTeam: {
            id: homeTeam.id!,
            name: homeTeam.name,
            slug: homeTeam.slug!,
            crestUrl: homeTeam.crestUrl!,
          },
          awayTeam: {
            id: awayTeam.id!,
            name: awayTeam.name,
            slug: awayTeam.slug!,
            crestUrl: awayTeam.crestUrl!,
          },
          slug: `${homeTeam.tla?.toLowerCase()}-${awayTeam.tla?.toLowerCase()}`,
          utcDate: data.utcDate,
          result: {
            goalsHomeTeam: data.score.fullTime.home,
            goalsAwayTeam: data.score.fullTime.away,
          },
          odds: data.odds,
          externalReference: {
            [this.footballApiProvider]: {
              id: data.id,
            },
          },
        } as Match;
      },
    );
  }

  public map(data: any[]): any[] {
    return data;
  }
}
