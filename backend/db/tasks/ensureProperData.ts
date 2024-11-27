import { forkJoin, from, lastValueFrom, map, mergeMap, of, range } from 'rxjs';
import { CompetitionRepositoryImpl } from '../repositories/competition.repo';
import { UserRepositoryImpl } from '../repositories/user.repo';
import { GameRoundRepositoryImpl } from '../repositories/gameRound.repo';
import { SeasonRepositoryImpl } from '../repositories/season.repo';
import { MatchRepositoryImpl } from '../repositories/match.repo';
import { concatMap, count, filter, finalize, takeLast, tap } from 'rxjs/operators';
import { PredictionRepositoryImpl } from '../repositories/prediction.repo';
import { Match } from '../models';
import mongoose, { ConnectOptions } from 'mongoose';
import { LeaderboardRepositoryImpl } from '../repositories/leaderboard.repo';
import { UserScoreRepositoryImpl } from '../repositories/userScore.repo';
import PredictionCalculator from '../../app/schedulers/prediction.calculator';
import { FootballApiClientImpl } from '../../thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { get } from 'lodash';

function ensureProperPredictions() {
  const competionRepo = CompetitionRepositoryImpl.getInstance();
  const seasonRepo = SeasonRepositoryImpl.getInstance();
  const roundRepo = GameRoundRepositoryImpl.getInstance();
  const matchRepo = MatchRepositoryImpl.getInstance();
  const predictionRepo = PredictionRepositoryImpl.getInstance();
  const userRepo = UserRepositoryImpl.getInstance();
  const competitionSlug = process.argv[2];

  return competionRepo.findOne$({ slug: competitionSlug })
    .pipe(
      mergeMap(competition => {
        // get all users who predict the competition
        return userRepo.findAll$()
          .pipe(
            map(users => ({ competition, users }))
          )
      }),
      mergeMap(({ competition, users }) => {
        const currentSeasonId = competition.currentSeason?.toString();
        return seasonRepo.findById$(currentSeasonId!)
        .pipe(
          mergeMap(season => {
            const currentRound = season?.currentGameRound;
            return roundRepo.findById$(currentRound?.toString()!)
              .pipe(
                map(round => ({ seasonId: season.id, currentRound: round })),
                filter(({ currentRound }) => !!currentRound)
              )
          }),
          mergeMap(({ seasonId, currentRound }) => {
            return range(1, currentRound.position)
              .pipe(
                map(position => ({ seasonId, roundPosition: position }))
              )
          }),
          mergeMap(({ seasonId, roundPosition }) => {
            return roundRepo.findOne$({ season: seasonId, position: roundPosition })
              .pipe(
                map(round => ({ seasonId, round }))
              )
          }),
          mergeMap(({ seasonId, round }) => {
            return matchRepo.findAll$({ season: seasonId, gameRound: round.id })
              .pipe(
                map(matches => {
                  return matches.map(match => ({ ...match, status: 'SCHEDULED' }) as Match);
                }),
                map(matches => ({ round, roundMatches: matches })),
              )
          }),
          mergeMap(({ round, roundMatches }) => {
            return from(users)
              .pipe(
                // filter roundMatches where kickoff is greater than user create date
                map(user => ({ userId: user.id!, round, roundMatches })),
                tap(({ userId, round, roundMatches }) => {
                  const { id, position } = round;
                  console.log(`Creating predictions for user ${userId} and round(${position}) ${id} for ${roundMatches.length} matches`)
                }),
                concatMap(({ userId, roundMatches }) => {
                  return predictionRepo.findOrCreatePredictions$(userId, roundMatches);
                }),
                takeLast(1),
                map(() => {
                  const matches = roundMatches.map(({ status, ...rest}) => rest);
                  return { round, roundMatches: matches };
                }),
              )
          }),
          tap(({ round }) => {
            console.log(`All predictions updated or created for round(${round.position}) ${round.id}`);
          }),
        )
      }),
      finalize(() => { console.log('Done updating or creating predictions') })
    )
}

function ensurePredictionsCalculated() {
  const competionRepo = CompetitionRepositoryImpl.getInstance();
  const seasonRepo = SeasonRepositoryImpl.getInstance();
  const matchRepo = MatchRepositoryImpl.getInstance();
  const predictionRepo = PredictionRepositoryImpl.getInstance();
  const competitionSlug = process.argv[2];
  const predictionCalculator = PredictionCalculator.getInstance();

  return competionRepo.findOne$({ slug: competitionSlug })
    .pipe(
      mergeMap(competition => {
        const currentSeasonId = competition.currentSeason?.toString();
        return seasonRepo.findById$(currentSeasonId!)
      }),
      mergeMap(season => {
        return predictionRepo.distinct$('user', { season: season.id })
          .pipe(
            mergeMap(userIds => {
              return matchRepo.findAllFinishedForSeason$(season.id!)
                .pipe(
                  map(matches => ({ userIds, matches }))
                )
            }),
            mergeMap(({ userIds, matches }) => {
              return from(matches)
                .pipe(
                  mergeMap(match => {
                    return from(userIds)
                      .pipe(
                        map(userId => ({ userId, match }))
                      )
                  }),
                  mergeMap(({ userId, match }) => {
                    return predictionRepo.findOne$(userId, match.id!)
                      .pipe(
                        map(prediction => ({ userId, match, prediction })),
                        filter(({ prediction }) => prediction != null)
                      )
                  }),
                  mergeMap(({ match, prediction }) => {
                    const { result } = match;
                    const { choice } = prediction;

                    const scorePoints = predictionCalculator.calculateScore(result!, choice);
                    return predictionRepo.findByIdAndUpdate$(prediction.id!, { scorePoints })
                  }),
                  count(),
                  map(count => ({ userIds, matches, count }))
                )
              }),
            mergeMap(({ userIds, matches, count }) => {
              const _matches = matches.map(match => ({ ...match, allPredictionPointsCalculated: true }));
              return matchRepo.updateMany$(_matches)
                .pipe(
                  map(() => ({ userCount: userIds.length, matchCount: matches.length, predictionCount: count }))
                )
            }),
            tap(({ userCount, matchCount, predictionCount}) => {
              console.log(`All prediction points calculated for users ${userCount}, matches ${matchCount}, predictions ${predictionCount}`);
            }),
          )
      }),
    )
}

function ensureProperUserScores() {
  const competionRepo = CompetitionRepositoryImpl.getInstance();
  const seasonRepo = SeasonRepositoryImpl.getInstance();
  const roundRepo = GameRoundRepositoryImpl.getInstance();
  const matchRepo = MatchRepositoryImpl.getInstance();
  const predictionRepo = PredictionRepositoryImpl.getInstance();
  const leaderboardRepo = LeaderboardRepositoryImpl.getInstance();
  const userScoreRepo = UserScoreRepositoryImpl.getInstance();
  const competitionSlug = process.argv[2];

  return competionRepo.findOne$({ slug: competitionSlug })
    .pipe(
      mergeMap(competition => {
        const currentSeasonId = competition.currentSeason?.toString();
        return seasonRepo.findById$(currentSeasonId!)
          .pipe(
            mergeMap(season => {
              return predictionRepo.distinct$('user', { season: season.id })
                .pipe(
                  mergeMap( userIds => {
                    const currentRound = season?.currentGameRound;
                    return roundRepo.findById$(currentRound?.toString()!)
                      .pipe(
                        mergeMap(currentRound => {
                          return range(1, currentRound.position)
                        }),
                        mergeMap(roundPosition => {
                          return roundRepo.findOne$({ season: season.id, position: roundPosition })
                        }),
                        mergeMap(round => {
                          return matchRepo.findAll$({ season: season.id, gameRound: round.id })
                            .pipe(
                              map(matches => ({ round, roundMatches: matches }))
                            )
                        }),
                        mergeMap(({ round, roundMatches }) => {
                          const seasonLeaderboard$ = leaderboardRepo.findOrCreateSeasonLeaderboard$(season.id!);
                          const roundLeaderboard$ = leaderboardRepo.findOrCreateRoundLeaderboard$(season.id!, round.id!);
                          return forkJoin([seasonLeaderboard$, roundLeaderboard$])
                            .pipe(
                              mergeMap(leaderboards => from(leaderboards)),
                              map(leaderboard => ({ leaderboard, round, roundMatches }))
                            )
                        }),
                        mergeMap(({ leaderboard, round, roundMatches }) => {
                          return from(roundMatches)
                            .pipe(
                              mergeMap(roundMatch => {
                                return from(userIds)
                                  .pipe(
                                    map(userId => ({ leaderboard, roundMatch, userId }))
                                  )
                              }),
                              mergeMap(({ leaderboard, roundMatch, userId }) => {
                                return predictionRepo.findOne$(userId, roundMatch.id!)
                                  .pipe(
                                    map(prediction => ({ leaderboard, userId, roundMatch, prediction })),
                                    filter(({ prediction }) => prediction?.scorePoints != null)
                                  )
                              }),
                              tap(({ leaderboard, userId, roundMatch, prediction }) => {
                                console.log(`Updating score in ${leaderboard.boardType} ${leaderboard.id} ` +
                                  `for user ${userId} and match ${roundMatch.id} in round(${round.position}) ${round.id}`)
                              }),
                              concatMap(({ leaderboard, userId, roundMatch, prediction }) => {
                                const { scorePoints: points, hasJoker } = prediction;
                                return userScoreRepo.findScoreAndUpsert$(
                                  { leaderboardId: leaderboard.id!, userId },
                                  points!,
                                  {
                                    matchId: roundMatch.id!,
                                    predictionId: prediction.id!,
                                    hasJoker: hasJoker!
                                  }
                                )
                              }),
                              takeLast(1),
                              mergeMap(() => {
                                const matchIds = roundMatches.map(m => m.id!);
                                return leaderboardRepo.findByIdAndUpdateMatches$(leaderboard.id!, matchIds)
                              }),
                              tap(() => {
                                console.log(`All scores updated for ${leaderboard.boardType} ${leaderboard.id}, ` +
                                  `for round(${round.position}) ${round.id}`)
                              }),
                              map(() => ({ leaderboard, round }))
                            )
                        }),
                        mergeMap(({ leaderboard, round }) => {
                          return userScoreRepo.findByLeaderboardIdOrderByPoints$(leaderboard.id!)
                            .pipe(
                              mergeMap(userScores => from(userScores)),
                              concatMap((userScore, index) => {
                                const previousPosition = userScore.positionNew || 0;
                                const positionOld = previousPosition;
                                const positionNew = index + 1;
                                if (positionNew === positionOld) {
                                  return of(userScore);
                                }
                                return userScoreRepo.findByIdAndUpdate$(userScore.id!, {
                                  positionNew,
                                  positionOld,
                                })
                              }),
                              takeLast(1),
                              tap(() => {
                                console.log(`All positions updated for ${leaderboard.boardType} ${leaderboard.id}, ` +
                                  `for round(${round.position}) ${round.id}`)
                              })
                            )
                        })
                      )
                  }),
                )
            }),
          )
      }),
    )
}

function ensureLatestMatchUpdates() {
  const footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
  const competionRepo = CompetitionRepositoryImpl.getInstance();
  const matchRepo = MatchRepositoryImpl.getInstance(footballApiProvider);
  const apiClient = FootballApiClientImpl.getInstance(footballApiProvider);
  const competitionSlug = process.argv[2];

  return competionRepo.findOne$({ slug: competitionSlug })
    .pipe(
      mergeMap(competition => {
        const externalIdKey = `externalReference.${footballApiProvider}.id`;
        const externalId = get(competition, externalIdKey);
        console.log(`Fetching matches for ${footballApiProvider} competition - api-id: ${externalId} name: ${competition.name}`);
        return apiClient.getCompetitionMatches(externalId)
      }),
      mergeMap(response => {
        let matches = response.data.matches || [];
        return matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
      }),
      finalize(() => { console.log('Done updating competion matches') })
    )
}

async function connectWithRetry() {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ligipredictor';
  try {
    if (mongoose.connection.readyState === 1) {
      const { port, host, name } = mongoose.connection;
      const mongoUri = `mongodb://${host}:${port}/${name}`;
      console.info(`Connected to MongoDB: ${mongoUri}`);
    } else {
      await mongoose.connect(
        dbUri,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as ConnectOptions);
      console.info(`Connected to MongoDB: ${dbUri}`);
    }
  } catch (err: any) {
    console.error(`ERROR CONNECTING TO MONGO: ${err}`);
    console.error(`Please make sure that ${dbUri} is running.`);
  }
}

async function main() {
  await connectWithRetry();
  await lastValueFrom(ensureLatestMatchUpdates());
  await lastValueFrom(ensureProperPredictions());
  await lastValueFrom(ensurePredictionsCalculated());
  await lastValueFrom(ensureProperUserScores());
  process.exit(0);
}

main().catch(err => console.error(err));
