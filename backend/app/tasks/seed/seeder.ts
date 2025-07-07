import {
  generateGamedays,
  generateSchedule,
} from 'db/scheduleGenerator/index.js';
import fs from 'fs';
import { flatMap } from 'lodash';
import mongoose from 'mongoose';
import path from 'path';
import { generate, lastValueFrom } from 'rxjs';

import {
  Competition,
  GameRound,
  Match,
  Season,
  Team,
} from '../../../db/models/index.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  GameRoundRepository,
  GameRoundRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../db/repositories/index.js';

export class Seeder {
  constructor(
    private connectionUrl: string,
    private competitionRepo: CompetitionRepository,
    private teamRepo: TeamRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository
  ) {}

  static getInstance(connectionUrl: string) {
    const competitionRepo = CompetitionRepositoryImpl.getInstance();
    const teamRepo = TeamRepositoryImpl.getInstance();
    const seasonRepo = SeasonRepositoryImpl.getInstance();
    const gameRoundRepo = GameRoundRepositoryImpl.getInstance();
    const matchRepo = MatchRepositoryImpl.getInstance();

    return new Seeder(
      connectionUrl,
      competitionRepo,
      teamRepo,
      seasonRepo,
      gameRoundRepo,
      matchRepo
    );
  }

  async init(): Promise<void> {
    try {
      console.log(`Connecting to ${this.connectionUrl}...`);
      await mongoose.connect(this.connectionUrl);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }

  async close(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('Connection closed');
    } catch (error) {
      console.error('Error closing connection:', error);
      throw new Error('Failed to close MongoDB connection');
    }
  }

  async seed() {
    this.ensureConnected();
    console.log('seeding db..');
    await this.seedCompetitions();
    console.info('Seeded competitions successfully.');
    const teams = await this.seedTeams();
    console.info('Seeded teams successfully.');
    await this.seedSeasons(teams);
    console.info('Seeded seasons successfully.');
    await this.seedGameRounds();
    console.info('Seeded game rounds successfully.');
    await this.seedMatches();
    // await this.seedUsers()
    console.info('Seeding completed successfully.');
  }

  private async seedCompetitions() {
    const competitions = [
      {
        code: 'WPL',
        name: 'What Premier League',
        slug: 'what-premier-league',
      },
    ] as Competition[];

    await this.clearCompetitions(competitions.map(c => c.slug));
    await lastValueFrom(this.competitionRepo.createMany$(competitions));
  }

  private ensureConnected(): void {
    if (
      mongoose.connection.readyState !== mongoose.ConnectionStates.connected ||
      !mongoose.connection.db
    ) {
      throw new Error(
        'Not connected to MongoDB or database handle is unavailable.'
      );
    }
  }

  private async seedTeams() {
    const dataPath = path.resolve(__dirname, './what-teams.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Team[];

    await this.clearTeams(data.map(t => t.slug));
    const teams = await lastValueFrom(this.teamRepo.createMany$(data));
    return teams;
  }

  private async seedSeasons(teams: Team[]) {
    const competition = await lastValueFrom(
      this.competitionRepo.findOne$({
        slug: 'what-premier-league',
      })
    );

    if (!competition) {
      throw new Error('No competition found with slug "what-premier-league"');
    }

    const baseSeason = {
      competition: {
        id: competition.id,
        name: competition.name,
        slug: competition.slug,
      },
      numberOfGames: 380,
      numberOfRounds: 38,
      numberOfTeams: 20,
      teams: teams.map(team => team.id),
    };
    const season1: Team = {
      ...baseSeason,
      currentMatchday: 38,
      name: '2023-2024',
      seasonEnd: new Date('2024-05-25T00:00:00+0200'),
      seasonStart: new Date('2023-05-16T00:00:00+0200'),
      slug: '2023-24',
      year: '2023',
    };
    const season2: Team = {
      ...baseSeason,
      currentMatchday: 37,
      name: '2024-2025',
      seasonEnd: new Date('2025-05-25T00:00:00+0200'),
      seasonStart: new Date('2024-05-16T00:00:00+0200'),
      slug: '2024-25',
      year: '2024',
    };

    await this.clearSeasons([season1.slug, season2.slug]);
    await lastValueFrom(this.seasonRepo.createMany$([season1, season2]));
  }

  private async seedGameRounds() {
    const seasons = await this.getSeededSeasons();
    await this.clearGameRounds(seasons.map(s => s.id!));

    const gameRounds = flatMap(
      seasons.map(season => {
        const teams: Team[] = season.teams as Team[];

        const gamedays = generateGamedays(teams);
        const gameRounds: GameRound[] = gamedays.map((_, index) => ({
          name: `Gameweek ${(index + 1).toString()}`,
          position: index + 1,
          season: season.id,
          slug: `gameweek-${(index + 1).toString()}`,
        }));
        return gameRounds;
      })
    );
    await lastValueFrom(this.gameRoundRepo.createMany$(gameRounds));
  }

  private async seedMatches() {
    const seasons = await this.getSeededSeasons();
    await this.clearMatches(seasons.map(s => s.id!));

    const seedMatches = flatMap(
      await Promise.all(
        seasons.map(async season => {
          const teams: Team[] = season.teams as Team[];
          const schedule = generateSchedule(teams, true);
          console.log('gamedays', schedule.length);
          const seasonMatches = flatMap(
            await Promise.all(
              schedule.map(async (gamedayMatches, index) => {
                const position = index + 1;
                const gameRound = await lastValueFrom(
                  this.gameRoundRepo.findOne$({
                    position,
                  })
                );

                if (!gameRound) {
                  throw new Error(
                    `Game round not found for season ${String(season.slug)} position ${position.toString()}`
                  );
                }

                const roundMatches = gamedayMatches.map(match => {
                  const homeTeam = teams.find(t => t.id === match.home?.id)!;
                  const awayTeam = teams.find(t => t.id === match.away?.id)!;
                  return {
                    awayTeam: {
                      id: awayTeam.id,
                      name: awayTeam.name,
                      slug: awayTeam.slug,
                    },
                    gameRound: gameRound.id,
                    homeTeam: {
                      id: homeTeam.id,
                      name: homeTeam.name,
                      slug: homeTeam.slug,
                    },
                    season: season.id!,
                    slug: `${String(homeTeam.tla).toLowerCase()}-v-${String(awayTeam.tla).toLowerCase()}`,
                    status: 'SCHEDULED',
                    utcDate: new Date().toUTCString(), // TODO: set better kickoff
                  };
                }) as Match[];
                return roundMatches;
              })
            )
          );
          return seasonMatches;
        })
      )
    );
    await lastValueFrom(this.matchRepo.createMany$(seedMatches));
  }

  private async clearCompetitions(competitionSlugs: string[]) {
    await lastValueFrom(
      this.competitionRepo.deleteMany$({
        slug: { $in: competitionSlugs },
      })
    );
  }

  private async clearTeams(teamSlugs: string[]) {
    await lastValueFrom(
      this.teamRepo.deleteMany$({
        slug: { $in: teamSlugs },
      })
    );
  }

  private async clearSeasons(seasonSlugs: string[]) {
    await lastValueFrom(
      this.seasonRepo.deleteMany$({
        slug: { $in: seasonSlugs },
      })
    );
  }

  private async clearGameRounds(seasonIds: string[]) {
    await lastValueFrom(
      this.gameRoundRepo.deleteMany$({
        season: { $in: seasonIds },
      })
    );
  }

  private async clearMatches(seasonIds: string[]) {
    await lastValueFrom(
      this.matchRepo.deleteMany$({
        season: { $in: seasonIds },
      })
    );
  }

  private async getSeededSeasons(): Promise<Season[]> {
    const competitionSlug = 'what-premier-league';
    const seasons = await lastValueFrom(
      this.seasonRepo.findAll$(
        {
          'competition.slug': competitionSlug,
          slug: { $in: ['2023-24', '2024-25'] },
        },
        null,
        'teams'
      )
    );
    if (seasons.length === 0) {
      throw new Error(`No seasons found for ${competitionSlug}`);
    }
    return seasons;
  }
}
