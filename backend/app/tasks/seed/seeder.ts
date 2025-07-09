import { generateSchedule } from 'db/scheduleGenerator/index.js';
import fs from 'fs';
import { flatMap, matches } from 'lodash';
import mongoose from 'mongoose';
import path from 'path';
import { from, lastValueFrom, map, mergeMap, of, tap, toArray } from 'rxjs';

import {
  Competition,
  GameRound,
  Match,
  Season,
  Team,
  User,
} from '../../../db/models/index.js';
import {
  CompetitionRepositoryImpl,
  GameRoundRepositoryImpl,
  MatchRepositoryImpl,
  PredictionRepositoryImpl,
  SeasonRepositoryImpl,
  TeamRepositoryImpl,
  UserRepositoryImpl,
} from '../../../db/repositories/index.js';
import { PasswordHasherImpl } from '../../api/auth/providers/passwordHasher.js';

const SEED_COMPETITION_SLUG = 'what-premier-league';
const TESTER_1 = 'tester1';
const TESTER_2 = 'tester2';
export class Seeder {
  constructor(private connectionUrl: string) {}

  private competitionRepo = CompetitionRepositoryImpl.getInstance();
  private teamRepo = TeamRepositoryImpl.getInstance();
  private seasonRepo = SeasonRepositoryImpl.getInstance();
  private gameRoundRepo = GameRoundRepositoryImpl.getInstance();
  private matchRepo = MatchRepositoryImpl.getInstance();
  private userRepo = UserRepositoryImpl.getInstance();
  private passwordHasher = PasswordHasherImpl.getInstance();
  private predictionRepo = PredictionRepositoryImpl.getInstance();

  static getInstance(connectionUrl: string) {
    const competitionRepo = CompetitionRepositoryImpl.getInstance();

    return new Seeder(connectionUrl);
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
    await this.clearCollections();

    await this.seedCompetitions();
    console.info('Seeded competitions successfully.');

    const seasonTeams = await this.seedTeams();
    console.info('Seeded teams successfully.');

    await this.seedSeasons(seasonTeams);
    console.info('Seeded seasons successfully.');

    await this.seedGameRounds();
    await this.updateCurrentRound();
    console.info('Seeded game-rounds successfully.');

    await this.seedMatches();
    console.info('Seeded matches successfully.');

    await this.seedUsers();
    console.info('Seeded users successfully.');

    await this.seedPredictions();
    console.info('Seeded predictions successfully.');

    // update matches
    // await this.updateMatches();
    console.info('Updated matches successfully.');
    // process predictions
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

  private async clearCollections() {
    await this.clearCompetitions([SEED_COMPETITION_SLUG]);
    const seasons = await lastValueFrom(
      this.seasonRepo.findAll$(
        {
          'competition.slug': SEED_COMPETITION_SLUG,
        },
        null,
        {
          populate: 'teams',
        }
      )
    );
    await this.clearSeasons(seasons.map(s => s.slug!));
    await this.clearGameRounds(seasons.map(s => s.id!));
    await this.clearMatches(seasons.map(s => s.id!));
    await this.clearTeams();
    await this.clearUsers();
    await this.clearPredictions(seasons.map(s => s.id!));
  }

  private async seedCompetitions() {
    const competitions = [
      {
        code: 'WPL',
        name: 'What Premier League',
        slug: SEED_COMPETITION_SLUG,
      },
    ] as Competition[];

    await lastValueFrom(this.competitionRepo.createMany$(competitions));
  }

  private async seedTeams() {
    const teamData = this.getTeamsToSeed();
    const teams = await lastValueFrom(this.teamRepo.createMany$(teamData));
    return teams;
  }

  private async seedSeasons(teams: Team[]) {
    const competition = await lastValueFrom(
      this.competitionRepo.findOne$({
        slug: SEED_COMPETITION_SLUG,
      })
    );

    if (!competition) {
      throw new Error(
        `No competition found with slug ${SEED_COMPETITION_SLUG}`
      );
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

    await lastValueFrom(this.seasonRepo.createMany$([season1, season2]));
  }

  private async seedGameRounds() {
    const seasons = await this.getSeededSeasons();
    const gameRounds = flatMap(
      seasons.map(season => {
        const teams: Team[] = season.teams as Team[];

        const schedule = generateSchedule(teams, true);
        const gameRounds: GameRound[] = schedule.map(
          (_gamedayMatches, index) => ({
            name: `Gameweek ${(index + 1).toString()}`,
            position: index + 1,
            season: season.id,
            slug: `gameweek-${(index + 1).toString()}`,
          })
        );
        return gameRounds;
      })
    );
    await lastValueFrom(this.gameRoundRepo.createMany$(gameRounds));
  }

  private async updateCurrentRound() {
    const seasons = await this.getSeededSeasons();
    for (const season of seasons) {
      const currentMatchday = season.currentMatchday;
      const gameRound = await lastValueFrom(
        this.gameRoundRepo.findOne$({
          position: currentMatchday,
          season: season.id,
        })
      );
      if (!gameRound) {
        throw new Error(
          `No game round found for season ${String(season.slug)}`
        );
      }
      await lastValueFrom(
        this.seasonRepo.findByIdAndUpdate$(season.id!, {
          currentGameRound: gameRound.id,
        })
      );
    }
  }

  private async seedMatches() {
    const seasons = await this.getSeededSeasons();
    await lastValueFrom(
      from(seasons).pipe(
        mergeMap(season => {
          const teams = season.teams as Team[];
          const schedule = generateSchedule(teams, true);
          return of({ schedule, seasonId: season.id!, teams });
        }),
        mergeMap(({ schedule, seasonId, teams }) => {
          return from(schedule).pipe(
            mergeMap((gamedayMatches, index) => {
              const position = index + 1;
              return this.gameRoundRepo
                .findOne$({
                  position,
                  season: seasonId,
                })
                .pipe(
                  map(gameRound => {
                    if (!gameRound) {
                      throw new Error(
                        `Game round not found for season ${String(seasonId)} position ${position.toString()}`
                      );
                    }
                    return {
                      gamedayMatches,
                      gameRoundId: gameRound.id,
                      seasonId,
                      teams,
                    };
                  })
                );
            })
          );
        }),
        mergeMap(({ gamedayMatches, gameRoundId, seasonId, teams }) => {
          return gamedayMatches.map(match => {
            const homeTeam = teams.find(t => t.id === match.home?.id)!;
            const awayTeam = teams.find(t => t.id === match.away?.id)!;
            return {
              awayTeam: {
                id: awayTeam.id,
                name: awayTeam.name,
                slug: awayTeam.slug,
              },
              gameRound: gameRoundId,
              homeTeam: {
                id: homeTeam.id,
                name: homeTeam.name,
                slug: homeTeam.slug,
              },
              season: seasonId,
              slug: `${String(homeTeam.tla).toLowerCase()}-v-${String(awayTeam.tla).toLowerCase()}`,
              status: 'SCHEDULED',
              utcDate: new Date().toUTCString(), // TODO: set better kickoff
            };
          }) as Match[];
        }),
        toArray(),
        map(arrays => arrays.flat()),
        mergeMap(matches => {
          return this.matchRepo.createMany$(matches);
        })
      )
    );
  }

  private async seedUsers() {
    const hashPassword = this.passwordHasher.hashPassword.bind(
      this.passwordHasher
    );
    const testUser1: User = {
      password: await hashPassword(`!0_Az${TESTER_1}`), // must have at least these letters be valid
      username: TESTER_1,
    };

    const testUser2: User = {
      password: await hashPassword(`!0_Az${TESTER_2}`),
      username: TESTER_2,
    };

    await lastValueFrom(this.userRepo.createMany$([testUser1, testUser2]));
  }

  private async seedPredictions() {
    const users = await this.getSeededUsers();
    const seasons = await this.getSeededSeasons();

    await lastValueFrom(
      from(seasons).pipe(
        mergeMap(season => {
          return this.gameRoundRepo.findAll$({
            season: season.id,
          });
        }),
        mergeMap(rounds => {
          return from(rounds).pipe(
            mergeMap(round => {
              return this.matchRepo.findAll$({
                gameRound: round.id,
              });
            })
          );
        }),
        mergeMap(roundMatches => {
          return from(users).pipe(
            map(user => ({ roundMatches, userId: user.id! }))
          );
        }),
        mergeMap(({ roundMatches, userId }) => {
          return this.predictionRepo.findOrCreatePicks$(userId, roundMatches);
        })
      )
    );
  }

  private async clearCompetitions(competitionSlugs: string[]) {
    await lastValueFrom(
      this.competitionRepo.deleteMany$({
        slug: { $in: competitionSlugs },
      })
    );
  }

  private async clearTeams() {
    const teamSlugs = this.getTeamsToSeed().map(t => t.slug);
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

  private async clearUsers() {
    await lastValueFrom(
      this.userRepo.deleteMany$({
        username: { $in: [TESTER_1, TESTER_2] },
      })
    );
  }

  private async clearPredictions(seasonIds: string[]) {
    await lastValueFrom(
      this.predictionRepo.deleteMany$({
        season: { $in: seasonIds },
      })
    );
  }

  private getTeamsToSeed() {
    const dataPath = path.resolve(__dirname, './what-teams.json');
    const teams = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Team[];

    return teams;
  }

  private async getSeededSeasons(): Promise<Season[]> {
    const seasons = await lastValueFrom(
      this.seasonRepo.findAll$(
        {
          'competition.slug': SEED_COMPETITION_SLUG,
          slug: { $in: ['2023-24', '2024-25'] },
        },
        null,
        {
          populate: 'teams',
        }
      )
    );
    if (seasons.length === 0) {
      throw new Error(`No seasons found for ${SEED_COMPETITION_SLUG}`);
    }
    return seasons;
  }

  private async getSeededUsers(): Promise<User[]> {
    const users = await lastValueFrom(
      this.userRepo.findAll$({
        username: { $in: [TESTER_1, TESTER_2] },
      })
    );
    if (users.length === 0) {
      throw new Error('No seeded users found');
    }
    return users;
  }

  private async getSeededMatches(): Promise<Match[]> {
    const seasons = await this.getSeededSeasons();

    const matches = await lastValueFrom(
      this.matchRepo.findAll$({
        season: { $in: seasons.map(s => s.id) },
      })
    );
    if (matches.length === 0) {
      throw new Error('No seeded matches found');
    }
    return matches;
  }
}
