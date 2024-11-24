import { from, lastValueFrom, map, mergeMap, of, range } from 'rxjs';
import { CompetitionRepositoryImpl } from '../repositories/competition.repo';
import { UserRepositoryImpl } from '../repositories/user.repo';
import { GameRoundRepositoryImpl } from '../repositories/gameRound.repo';
import { SeasonRepositoryImpl } from '../repositories/season.repo';
import { MatchRepositoryImpl } from '../repositories/match.repo';
import { concatMap, filter, last, tap, toArray } from 'rxjs/operators';
import { PredictionRepositoryImpl } from '../repositories/prediction.repo';
import { User } from '../models';
import mongoose, { ConnectOptions } from 'mongoose';

function ensureProperPredictions(users: User[]) {
  const competionRepo = CompetitionRepositoryImpl.getInstance();
  const seasonRepo = SeasonRepositoryImpl.getInstance();
  const roundRepo = GameRoundRepositoryImpl.getInstance();
  const matchRepo = MatchRepositoryImpl.getInstance();
  const predictionRepo = PredictionRepositoryImpl.getInstance();
  const competitionSlug = process.argv[2];

  return competionRepo.findOne$({ slug: competitionSlug })
  .pipe(
    mergeMap(competition => {
      const currentSeasonId = competition.currentSeason?.toString();
      return seasonRepo.findById$(currentSeasonId!);
    }),
    mergeMap(season => {
      const currentRound = season?.currentGameRound;
      return roundRepo.findById$(currentRound?.toString()!)
        .pipe(
          map(round => ({ seasonId: season.id, currentRound: round })),
          filter(({ currentRound }) => !!currentRound)
        )
    }),
    tap(({ seasonId, currentRound }) => console.log(`Creating predictions for season ${seasonId} upto round ${currentRound.position} ${currentRound.id}`)),
     mergeMap(({ seasonId, currentRound }) => {
      return range(1, currentRound.position)
        .pipe(
          map(position => ({ seasonId, roundPosition: position }))
        )
    }),
    tap(({ seasonId, roundPosition }) => console.log(`Creating predictions for round ${roundPosition} of season ${seasonId}`)),
    mergeMap(({ seasonId, roundPosition }) => {
      return roundRepo.findOne$({ season: seasonId, position: roundPosition })
        .pipe(
          map(round => ({ seasonId, roundId: round.id!, roundPosition }))
        )
    }),
    mergeMap(({ seasonId, roundId, roundPosition }) => {
      return matchRepo.findAll$({ season: seasonId, gameRound: roundId })
        .pipe(
          map(matches => {
            return matches.map(match => ({ ...match, status: 'SCHEDULED' }))
          }),
          map(matches => ({ seasonId, roundId, roundPosition, roundMatches: matches })),
        )
    }),
    tap(({ seasonId, roundId, roundPosition, roundMatches }) =>
      console.log(`Creating predictions for round(${roundPosition}) ${roundId} of season ${seasonId} for ${roundMatches.length} matches`)),
    mergeMap(({ roundId, roundMatches }) => {
      return from(users)
        .pipe(
          // filter roundMatches where kickoff is greater than user create date
          map(user => ({ userId: user.id!, roundId, roundMatches })),
        )
    }),
    tap(({ userId, roundId, roundMatches }) =>
      console.log(`Creating predictions for user ${userId} and round ${roundId} for ${roundMatches.length} matches`)),
    concatMap(({ userId, roundMatches }) => {
      return predictionRepo.findOrCreatePredictions$(userId, roundMatches);
    }),
    last(),
    tap(() => console.log('done'))
  )
}

async function main() {
  await connectWithRetry();
  const userRepo = UserRepositoryImpl.getInstance();
  const users = await lastValueFrom(userRepo.findAll$());
  await lastValueFrom(ensureProperPredictions(users));
  process.exit(0);
}

main().catch(err => console.error(err));

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
