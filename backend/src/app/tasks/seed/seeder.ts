import fs from 'fs';
import { flatMap, isNil } from 'lodash';
import mongoose from 'mongoose';
import path from 'path';
import {
  concatMap,
  EMPTY,
  filter,
  forkJoin,
  from,
  lastValueFrom,
  map,
  mergeMap,
  of,
  takeLast,
  tap,
  throwIfEmpty,
  toArray,
} from 'rxjs';

import { VosePredictorImpl } from '../../../db/helpers/vosePredictor.js';
import {
  Competition,
  GameRound,
  Match,
  Prediction,
  Season,
  Team,
  User,
} from '../../../db/models/index.js';
import { MatchStatus } from '../../../db/models/match.model.js';
import {
  CompetitionRepositoryImpl,
  GameRoundRepositoryImpl,
  LeaderboardRepositoryImpl,
  MatchRepositoryImpl,
  PredictionRepositoryImpl,
  SeasonRepositoryImpl,
  TeamRepositoryImpl,
  UserRepositoryImpl,
  UserScoreRepositoryImpl,
} from '../../../db/repositories/index.js';
import { generateSchedule } from '../../../db/scheduleGenerator/index.js';
import { PasswordHasherImpl } from '../../api/auth/providers/passwordHasher.js';
import PredictionCalculator from '../../schedulers/prediction.calculator.js';

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
  private leaderboardRepo = LeaderboardRepositoryImpl.getInstance();
  private userScoreRepo = UserScoreRepositoryImpl.getInstance();

  static getInstance(connectionUrl: string) {
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

    const seededComp = await this.getSeededCompetition();
    if (seededComp) {
      console.warn('✅ Seed data already exists. Skipping seeding.');
      return;
    }

    console.log('seeding db..');
    await this.clearCollections();

    await this.seedCompetitions();
    console.info('Seeded competitions successfully.');

    const seasonTeams = await this.seedTeams();
    console.info('Seeded teams successfully.');

    await this.seedSeasons(seasonTeams);
    await this.updateCompetitionWithCurrentSeason();
    console.info('Seeded seasons successfully.');

    await this.seedGameRounds();
    await this.updateSeasonWithCurrentRound();
    console.info('Seeded game-rounds successfully.');

    await this.seedMatches();
    console.info('Seeded matches successfully.');

    await this.seedUsers();
    console.info('Seeded users successfully.');

    await this.seedPredictions();
    console.info('Seeded predictions successfully.');

    await this.finishMatchesUptoCurrentRound();
    console.info('Updated matches successfully.');

    await this.processPredictions();
    console.info('Processed predictions successfully.');

    await this.updateUserScores();
    console.info('Updated user scores successfully.');
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

    const seasons = await this.getSeededSeasons();
    await this.clearSeasons(seasons.map(s => s.slug!));
    await this.clearGameRounds(seasons.map(s => s.id!));
    await this.clearMatches(seasons.map(s => s.id!));
    await this.clearTeams(
      seasons.flatMap(s => s.teams as Team[]).map(t => t.slug!)
    );
    await this.clearPredictions(seasons.map(s => s.id!));
    await this.clearLeaderboards(seasons.map(s => s.id!));

    const users = await this.getSeededUsers();
    await this.clearUserScores(users.map(u => u.id!));
    await this.clearUsers(users.map(u => u.username!));
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
      currentMatchday: 36,
      name: '2024-2025',
      seasonEnd: new Date('2025-05-25T00:00:00+0200'),
      seasonStart: new Date('2024-05-16T00:00:00+0200'),
      slug: '2024-25',
      year: '2024',
    };

    await lastValueFrom(this.seasonRepo.createMany$([season1, season2]));
  }

  private async updateCompetitionWithCurrentSeason() {
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

    const currentSeason = await lastValueFrom(
      this.seasonRepo.findOne$({
        'competition.id': competition.id,
        slug: '2023-24',
      })
    );

    if (!currentSeason) {
      throw new Error('Current season not found');
    }

    await lastValueFrom(
      this.competitionRepo.findByIdAndUpdate$(competition.id!, {
        currentSeason: currentSeason.id,
      })
    );
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

  private async updateSeasonWithCurrentRound() {
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
      password: await hashPassword(`!0_Az${TESTER_1}`),
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

  private async finishMatchesUptoCurrentRound() {
    const defaultVosePredictor = VosePredictorImpl.getInstance();
    const seasons = await this.getSeededSeasons();

    await lastValueFrom(
      from(seasons).pipe(
        mergeMap(season => {
          return this.gameRoundRepo.findById$(season.currentGameRound!).pipe(
            mergeMap(r => (r ? of(r) : EMPTY)),
            throwIfEmpty(
              () =>
                new Error(
                  `No current game round for season ${String(season.slug)}`
                )
            ),
            map(currentRound => ({ currentRound, season }))
          );
        }),
        mergeMap(({ currentRound, season }) => {
          return this.matchRepo
            .findAll$(
              {
                season: season.id,
              },
              null,
              {
                populate: 'gameRound',
              }
            )
            .pipe(
              mergeMap(matches => {
                const filteredMatches = matches.filter(match => {
                  const matchRound = match.gameRound as unknown as GameRound;
                  return matchRound.position! <= currentRound.position!;
                });
                return from(filteredMatches);
              })
            );
        }),
        map(match => {
          const randomScore = defaultVosePredictor.predict();
          const teamScores = randomScore.split('-');
          const goalsHomeTeam = Number(teamScores[0]);
          const goalsAwayTeam = Number(teamScores[1]);

          const update: Match = {
            ...match,
            result: {
              goalsAwayTeam,
              goalsHomeTeam,
            },
            status: MatchStatus.FINISHED,
          };

          return update;
        }),
        toArray(),
        mergeMap(matches => {
          return this.matchRepo.updateMany$(matches);
        })
      )
    );
  }

  private async processPredictions() {
    const seasons = await this.getSeededSeasons();
    const users = await this.getSeededUsers();
    const userIds = users.map(u => u.id!);
    const predictionCalculator = PredictionCalculator.getInstance();

    await lastValueFrom(
      from(seasons).pipe(
        mergeMap(season => {
          return this.matchRepo.findAllFinishedForSeason$(season.id!).pipe(
            mergeMap(matches => {
              return from(matches).pipe(
                mergeMap(match => {
                  return from(userIds).pipe(map(userId => ({ match, userId })));
                }),
                mergeMap(({ match, userId }) => {
                  return this.predictionRepo
                    .findOneByUserAndMatch$(userId, match.id!)
                    .pipe(
                      filter(prediction => prediction != null),
                      map(prediction => ({ match, prediction }))
                    );
                }),
                map(({ match, prediction }) => {
                  const scorePoints = predictionCalculator.calculateScore(
                    match.result!,
                    prediction.choice
                  );
                  const update: Prediction = {
                    ...prediction,
                    scorePoints,
                  };
                  return update;
                }),
                toArray(),
                mergeMap(predictions => {
                  return this.predictionRepo.updateMany$(predictions).pipe(
                    map(() => ({
                      matches,
                      nbPredictions: predictions.length,
                      nbUsers: userIds.length,
                    }))
                  );
                })
              );
            }),
            mergeMap(({ matches, nbPredictions, nbUsers }) => {
              const matches_ = matches.map(match => ({
                ...match,
                allPredictionPointsCalculated: true,
              }));
              return this.matchRepo.updateMany$(matches_).pipe(
                map(() => ({
                  nbMatches: matches.length,
                  nbPredictions,
                  nbUsers,
                }))
              );
            }),
            tap(({ nbMatches, nbPredictions, nbUsers }) => {
              console.log(
                `Season ${String(season.competition?.slug)} ${String(season.slug)}: ` +
                  `All prediction points calculated for ${String(nbUsers)} users, ` +
                  `${String(nbMatches)} matches and ${String(nbPredictions)} predictions`
              );
            })
          );
        })
      )
    );
  }

  private async updateUserScores() {
    const seasons = await this.getSeededSeasons();
    const users = await this.getSeededUsers();
    const userIds = users.map(u => u.id!);

    await lastValueFrom(
      from(seasons).pipe(
        mergeMap(season => {
          return this.gameRoundRepo
            .findAll$(
              {
                season: season.id,
              },
              null,
              { sort: { position: 1 } }
            )
            .pipe(
              mergeMap(rounds => from(rounds)),
              mergeMap(round => {
                return this.matchRepo
                  .findAll$({ gameRound: round.id })
                  .pipe(map(matches => ({ round, roundMatches: matches })));
              }),
              concatMap(({ round, roundMatches }) => {
                const seasonLeaderboard$ =
                  this.leaderboardRepo.findOrCreateSeasonLeaderboard$(
                    season.id!
                  );
                const roundLeaderboard$ =
                  this.leaderboardRepo.findOrCreateRoundLeaderboard$(
                    season.id!,
                    round.id!
                  );
                return forkJoin([seasonLeaderboard$, roundLeaderboard$]).pipe(
                  mergeMap(leaderboards => from(leaderboards)),
                  map(leaderboard => ({ leaderboard, roundMatches }))
                );
              }),
              concatMap(({ leaderboard, roundMatches }) => {
                return from(roundMatches).pipe(
                  mergeMap(roundMatch => {
                    return from(userIds).pipe(
                      map(userId => ({ leaderboard, roundMatch, userId }))
                    );
                  }),
                  mergeMap(({ leaderboard, roundMatch, userId }) => {
                    return this.predictionRepo
                      .findOneByUserAndMatch$(userId, roundMatch.id!)
                      .pipe(
                        filter(prediction => !isNil(prediction)),
                        filter(prediction => !isNil(prediction.scorePoints)),
                        map(prediction => ({
                          leaderboard,
                          prediction,
                          roundMatch,
                          userId,
                        }))
                      );
                  }),
                  concatMap(
                    ({ leaderboard, prediction, roundMatch, userId }) => {
                      const { hasJoker, scorePoints: points } = prediction;
                      return this.userScoreRepo.findScoreAndUpsert$(
                        { leaderboardId: leaderboard.id!, userId },
                        points!,
                        {
                          hasJoker: hasJoker!,
                          matchId: roundMatch.id!,
                          predictionId: prediction.id!,
                        }
                      );
                    }
                  ),
                  takeLast(1),
                  mergeMap(() => {
                    const matchIds = roundMatches.map(m => m.id!);
                    return this.leaderboardRepo.findByIdAndUpdateMatches$(
                      leaderboard.id!,
                      matchIds
                    );
                  })
                );
              }),
              mergeMap(leaderboard => {
                return this.userScoreRepo
                  .findByLeaderboardIdOrderByPoints$(leaderboard.id!)
                  .pipe(
                    mergeMap(userScores => from(userScores)),
                    concatMap((userScore, index) => {
                      const previousPosition = userScore.positionNew ?? 0;
                      const positionOld = previousPosition;
                      const positionNew = index + 1;
                      if (positionNew === positionOld) {
                        return of(userScore);
                      }
                      return this.userScoreRepo.findByIdAndUpdate$(
                        userScore.id!,
                        {
                          positionNew,
                          positionOld,
                        }
                      );
                    })
                  );
              }),
              takeLast(1),
              tap(() => {
                console.log(
                  `Season ${String(season.competition?.slug)} ${String(season.slug)}: ` +
                    'All user scores updated successfully'
                );
              })
            );
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

  private async clearUsers(usernames: string[]) {
    await lastValueFrom(
      this.userRepo.deleteMany$({
        username: { $in: usernames },
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

  private async clearLeaderboards(seasonIds: string[]) {
    await lastValueFrom(
      this.leaderboardRepo.deleteMany$({
        season: { $in: seasonIds },
      })
    );
  }

  private async clearUserScores(userIds: string[]) {
    await lastValueFrom(
      this.userScoreRepo.deleteMany$({
        user: { $in: userIds },
      })
    );
  }

  private getTeamsToSeed() {
    const dataPath = path.resolve(__dirname, './what-teams.json');
    const teams = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Team[];

    return teams;
  }

  private async getSeededCompetition(): Promise<Competition | null> {
    const competition = await lastValueFrom(
      this.competitionRepo.findOne$({
        slug: SEED_COMPETITION_SLUG,
      })
    );
    return competition;
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
    return seasons;
  }

  private async getSeededUsers(): Promise<User[]> {
    const users = await lastValueFrom(
      this.userRepo.findAll$({
        username: { $in: [TESTER_1, TESTER_2] },
      })
    );
    return users;
  }
}
