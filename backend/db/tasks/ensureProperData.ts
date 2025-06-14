// import { get } from 'lodash';
// import mongoose, { ConnectOptions } from 'mongoose';
// import { forkJoin, from, lastValueFrom, map, mergeMap, of, range } from 'rxjs';
// import {
//   concatMap,
//   count,
//   filter,
//   finalize,
//   takeLast,
//   tap,
// } from 'rxjs/operators';

// import PredictionCalculator from '../../app/schedulers/prediction.calculator.js';
// import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
// import { FootballApiClientImpl } from '../../thirdParty/footballApi/apiClient.js';
// import { Match } from '../models/index.js';
// import { CompetitionRepositoryImpl } from '../repositories/competition.repo.js';
// import { GameRoundRepositoryImpl } from '../repositories/gameRound.repo.js';
// import { LeaderboardRepositoryImpl } from '../repositories/leaderboard.repo.js';
// import { MatchRepositoryImpl } from '../repositories/match.repo.js';
// import { PredictionRepositoryImpl } from '../repositories/prediction.repo.js';
// import { SeasonRepositoryImpl } from '../repositories/season.repo.js';
// import { UserRepositoryImpl } from '../repositories/user.repo.js';
// import { UserScoreRepositoryImpl } from '../repositories/userScore.repo.js';

// async function connectWithRetry() {
//   const dbUri =
//     process.env.MONGO_URI ?? 'mongodb://localhost:27017/ligipredictor';
//   try {
//     if (
//       mongoose.connection.readyState === mongoose.ConnectionStates.connected
//     ) {
//       const { host, name, port } = mongoose.connection;
//       const mongoUri = `mongodb://${host}:${String(port)}/${name}`;
//       console.info(`Connected to MongoDB: ${mongoUri}`);
//     } else {
//       await mongoose.connect(dbUri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       } as ConnectOptions);
//       console.info(`Connected to MongoDB: ${dbUri}`);
//     }
//   } catch (err: any) {
//     console.error(`ERROR CONNECTING TO MONGO: ${err}`);
//     console.error(`Please make sure that ${dbUri} is running.`);
//   }
// }

// function ensureLatestMatchUpdates() {
//   const footballApiProvider = ApiProvider.API_FOOTBALL_DATA;
//   const competionRepo = CompetitionRepositoryImpl.getInstance();
//   const matchRepo = MatchRepositoryImpl.getInstance(footballApiProvider);
//   const apiClient = FootballApiClientImpl.getInstance(footballApiProvider);
//   const competitionSlug = process.argv[2];

//   return competionRepo.findOne$({ slug: competitionSlug }).pipe(
//     mergeMap(competition => {
//       const externalIdKey = `externalReference.${footballApiProvider}.id`;
//       const externalId = get(competition, externalIdKey);
//       console.log(
//         `Fetching matches for ${footballApiProvider} competition - api-id: ${externalId} name: ${competition.name}`
//       );
//       return apiClient.getCompetitionMatches(externalId);
//     }),
//     mergeMap(response => {
//       const matches = response.data.matches || [];
//       return matchRepo.findEachBySeasonAndTeamsAndUpsert$(matches);
//     }),
//     finalize(() => {
//       console.log('Done updating competion matches');
//     })
//   );
// }

// function ensurePredictionsCalculated() {
//   const competionRepo = CompetitionRepositoryImpl.getInstance();
//   const seasonRepo = SeasonRepositoryImpl.getInstance();
//   const matchRepo = MatchRepositoryImpl.getInstance();
//   const predictionRepo = PredictionRepositoryImpl.getInstance();
//   const competitionSlug = process.argv[2];
//   const predictionCalculator = PredictionCalculator.getInstance();

//   return competionRepo.findOne$({ slug: competitionSlug }).pipe(
//     mergeMap(competition => {
//       const currentSeasonId = competition.currentSeason?.toString();
//       return seasonRepo.findById$(currentSeasonId);
//     }),
//     mergeMap(season => {
//       return predictionRepo.distinct$('user', { season: season.id }).pipe(
//         mergeMap(userIds => {
//           return matchRepo
//             .findAllFinishedForSeason$(season.id)
//             .pipe(map(matches => ({ matches, userIds })));
//         }),
//         mergeMap(({ matches, userIds }) => {
//           return from(matches).pipe(
//             mergeMap(match => {
//               return from(userIds).pipe(map(userId => ({ match, userId })));
//             }),
//             mergeMap(({ match, userId }) => {
//               return predictionRepo.findOne$(userId, match.id).pipe(
//                 map(prediction => ({ match, prediction, userId })),
//                 filter(({ prediction }) => prediction != null)
//               );
//             }),
//             mergeMap(({ match, prediction }) => {
//               const { result } = match;
//               const { choice } = prediction;

//               const scorePoints = predictionCalculator.calculateScore(
//                 result,
//                 choice
//               );
//               return predictionRepo.findByIdAndUpdate$(prediction.id, {
//                 scorePoints,
//               });
//             }),
//             count(),
//             map(count => ({ count, matches, userIds }))
//           );
//         }),
//         mergeMap(({ count, matches, userIds }) => {
//           const _matches = matches.map(match => ({
//             ...match,
//             allPredictionPointsCalculated: true,
//           }));
//           return matchRepo.updateMany$(_matches).pipe(
//             map(() => ({
//               matchCount: matches.length,
//               predictionCount: count,
//               userCount: userIds.length,
//             }))
//           );
//         }),
//         tap(({ matchCount, predictionCount, userCount }) => {
//           console.log(
//             `All prediction points calculated for users ${String(userCount)}, matches ${String(matchCount)}, predictions ${String(predictionCount)}`
//           );
//         })
//       );
//     })
//   );
// }

// function ensureProperPredictions() {
//   const competionRepo = CompetitionRepositoryImpl.getInstance();
//   const seasonRepo = SeasonRepositoryImpl.getInstance();
//   const roundRepo = GameRoundRepositoryImpl.getInstance();
//   const matchRepo = MatchRepositoryImpl.getInstance();
//   const predictionRepo = PredictionRepositoryImpl.getInstance();
//   const userRepo = UserRepositoryImpl.getInstance();
//   const competitionSlug = process.argv[2];

//   return competionRepo.findOne$({ slug: competitionSlug }).pipe(
//     mergeMap(competition => {
//       // get all users who predict the competition
//       return userRepo.findAll$().pipe(map(users => ({ competition, users })));
//     }),
//     mergeMap(({ competition, users }) => {
//       const currentSeasonId = competition.currentSeason?.toString();
//       return seasonRepo.findById$(currentSeasonId).pipe(
//         mergeMap(season => {
//           const currentRound = season?.currentGameRound;
//           return roundRepo.findById$(currentRound?.toString()).pipe(
//             map(round => ({ currentRound: round, seasonId: season.id })),
//             filter(({ currentRound }) => !!currentRound)
//           );
//         }),
//         mergeMap(({ currentRound, seasonId }) => {
//           return range(1, currentRound.position).pipe(
//             map(position => ({ roundPosition: position, seasonId }))
//           );
//         }),
//         mergeMap(({ roundPosition, seasonId }) => {
//           return roundRepo
//             .findOne$({ position: roundPosition, season: seasonId })
//             .pipe(map(round => ({ round, seasonId })));
//         }),
//         mergeMap(({ round, seasonId }) => {
//           return matchRepo
//             .findAll$({ gameRound: round.id, season: seasonId })
//             .pipe(
//               map(matches => {
//                 return matches.map(
//                   match => ({ ...match, status: 'SCHEDULED' }) as Match
//                 );
//               }),
//               map(matches => ({ round, roundMatches: matches }))
//             );
//         }),
//         mergeMap(({ round, roundMatches }) => {
//           return from(users).pipe(
//             // filter roundMatches where kickoff is greater than user create date
//             map(user => ({ round, roundMatches, userId: user.id! })),
//             tap(({ round, roundMatches, userId }) => {
//               const { id, position } = round;
//               console.log(
//                 `Creating predictions for user ${userId} and round(${position}) ${id} for ${roundMatches.length} matches`
//               );
//             }),
//             concatMap(({ roundMatches, userId }) => {
//               return predictionRepo.findOrCreatePredictions$(
//                 userId,
//                 roundMatches
//               );
//             }),
//             takeLast(1),
//             map(() => {
//               const matches = roundMatches.map(({ status, ...rest }) => rest);
//               return { round, roundMatches: matches };
//             })
//           );
//         }),
//         tap(({ round }) => {
//           console.log(
//             `All predictions updated or created for round(${round.position}) ${round.id}`
//           );
//         })
//       );
//     }),
//     finalize(() => {
//       console.log('Done updating or creating predictions');
//     })
//   );
// }

// function ensureProperUserScores() {
//   const competionRepo = CompetitionRepositoryImpl.getInstance();
//   const seasonRepo = SeasonRepositoryImpl.getInstance();
//   const roundRepo = GameRoundRepositoryImpl.getInstance();
//   const matchRepo = MatchRepositoryImpl.getInstance();
//   const predictionRepo = PredictionRepositoryImpl.getInstance();
//   const leaderboardRepo = LeaderboardRepositoryImpl.getInstance();
//   const userScoreRepo = UserScoreRepositoryImpl.getInstance();
//   const competitionSlug = process.argv[2];

//   return competionRepo.findOne$({ slug: competitionSlug }).pipe(
//     mergeMap(competition => {
//       const currentSeasonId = competition.currentSeason?.toString();
//       return seasonRepo.findById$(currentSeasonId).pipe(
//         mergeMap(season => {
//           return predictionRepo.distinct$('user', { season: season.id }).pipe(
//             mergeMap(userIds => {
//               const currentRound = season?.currentGameRound;
//               return roundRepo.findById$(currentRound?.toString()).pipe(
//                 mergeMap(currentRound => {
//                   return range(1, currentRound.position);
//                 }),
//                 mergeMap(roundPosition => {
//                   return roundRepo.findOne$({
//                     position: roundPosition,
//                     season: season.id,
//                   });
//                 }),
//                 mergeMap(round => {
//                   return matchRepo
//                     .findAll$({ gameRound: round.id, season: season.id })
//                     .pipe(map(matches => ({ round, roundMatches: matches })));
//                 }),
//                 mergeMap(({ round, roundMatches }) => {
//                   const seasonLeaderboard$ =
//                     leaderboardRepo.findOrCreateSeasonLeaderboard$(season.id);
//                   const roundLeaderboard$ =
//                     leaderboardRepo.findOrCreateRoundLeaderboard$(
//                       season.id,
//                       round.id
//                     );
//                   return forkJoin([seasonLeaderboard$, roundLeaderboard$]).pipe(
//                     mergeMap(leaderboards => from(leaderboards)),
//                     map(leaderboard => ({ leaderboard, round, roundMatches }))
//                   );
//                 }),
//                 mergeMap(({ leaderboard, round, roundMatches }) => {
//                   return from(roundMatches).pipe(
//                     mergeMap(roundMatch => {
//                       return from(userIds).pipe(
//                         map(userId => ({ leaderboard, roundMatch, userId }))
//                       );
//                     }),
//                     mergeMap(({ leaderboard, roundMatch, userId }) => {
//                       return predictionRepo
//                         .findOne$(userId, roundMatch.id)
//                         .pipe(
//                           map(prediction => ({
//                             leaderboard,
//                             prediction,
//                             roundMatch,
//                             userId,
//                           })),
//                           filter(
//                             ({ prediction }) => prediction?.scorePoints != null
//                           )
//                         );
//                     }),
//                     tap(({ leaderboard, prediction, roundMatch, userId }) => {
//                       console.log(
//                         `Updating score in ${leaderboard.boardType} ${leaderboard.id} ` +
//                           `for user ${userId} and match ${roundMatch.id} in round(${round.position}) ${round.id}`
//                       );
//                     }),
//                     concatMap(
//                       ({ leaderboard, prediction, roundMatch, userId }) => {
//                         const { hasJoker, scorePoints: points } = prediction;
//                         return userScoreRepo.findScoreAndUpsert$(
//                           { leaderboardId: leaderboard.id!, userId },
//                           points,
//                           {
//                             hasJoker: hasJoker!,
//                             matchId: roundMatch.id!,
//                             predictionId: prediction.id!,
//                           }
//                         );
//                       }
//                     ),
//                     takeLast(1),
//                     mergeMap(() => {
//                       const matchIds = roundMatches.map(m => m.id!);
//                       return leaderboardRepo.findByIdAndUpdateMatches$(
//                         leaderboard.id,
//                         matchIds
//                       );
//                     }),
//                     tap(() => {
//                       console.log(
//                         `All scores updated for ${leaderboard.boardType} ${leaderboard.id}, ` +
//                           `for round(${round.position}) ${round.id}`
//                       );
//                     }),
//                     map(() => ({ leaderboard, round }))
//                   );
//                 }),
//                 mergeMap(({ leaderboard, round }) => {
//                   return userScoreRepo
//                     .findByLeaderboardIdOrderByPoints$(leaderboard.id)
//                     .pipe(
//                       mergeMap(userScores => from(userScores)),
//                       concatMap((userScore, index) => {
//                         const previousPosition = userScore.positionNew || 0;
//                         const positionOld = previousPosition;
//                         const positionNew = index + 1;
//                         if (positionNew === positionOld) {
//                           return of(userScore);
//                         }
//                         return userScoreRepo.findByIdAndUpdate$(userScore.id, {
//                           positionNew,
//                           positionOld,
//                         });
//                       }),
//                       takeLast(1),
//                       tap(() => {
//                         console.log(
//                           `All positions updated for ${leaderboard.boardType} ${leaderboard.id}, ` +
//                             `for round(${round.position}) ${round.id}`
//                         );
//                       })
//                     );
//                 })
//               );
//             })
//           );
//         })
//       );
//     })
//   );
// }

// async function main() {
//   await connectWithRetry();
//   await lastValueFrom(ensureLatestMatchUpdates());
//   await lastValueFrom(ensureProperPredictions());
//   await lastValueFrom(ensurePredictionsCalculated());
//   await lastValueFrom(ensureProperUserScores());
//   process.exit(0);
// }

// main().catch(err => {
//   console.error(err);
// });
