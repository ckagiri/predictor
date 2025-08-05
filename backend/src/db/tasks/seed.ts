import bson, { ObjectId } from 'bson';
import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose from 'mongoose';
import { lastValueFrom } from 'rxjs';
import vm from 'vm';

import getDbUri from '../../common/getDbUri.js';
import CompetitionModel from '../models/competition.model.js';
import GameRoundModel from '../models/gameRound.model.js';
import LeaderboardModel from '../models/leaderboard.model.js';
import MatchModel from '../models/match.model.js';
import PredictionModel from '../models/prediction.model.js';
import SeasonModel from '../models/season.model.js';
import TeamModel from '../models/team.model.js';
import UserModel from '../models/user.model.js';
import UserScoreModel from '../models/userScore.model.js';
import { SeasonRepositoryImpl } from '../repositories/season.repo.js';
import seedData2425 from './seedData/seed-2024-25.json';
import seedData2526 from './seedData/seed-2025-26.json';

export default {
  CompetitionModel,
  GameRoundModel,
  LeaderboardModel,
  MatchModel,
  PredictionModel,
  SeasonModel,
  TeamModel,
  UserModel,
  UserScoreModel,
};

interface SeedDataPartial {
  seasons: {
    current: {
      competition: {
        id: string;
      };
      slug: string;
    };
  };
}

async function connect() {
  const dbUri = getDbUri();
  console.info(`Connecting to MongoDB at ${dbUri}`);
  try {
    if (
      mongoose.connection.readyState === mongoose.ConnectionStates.connected
    ) {
      const { host, name, port } = mongoose.connection;
      const mongoUri = `mongodb://${host}:${String(port)}/${name}`;
      console.info(`Connected to MongoDB: ${mongoUri}`);
    } else {
      await mongoose.connect(dbUri);
      console.info(`Connected to MongoDB: ${dbUri}`);
    }
  } catch (err: unknown) {
    console.error(`ERROR CONNECTING TO MONGO: ${String(err)}`);
    console.error(`Please make sure that ${dbUri} is running.`);
  }
}

async function defaultDataExists(seedData: SeedDataPartial) {
  const seasonRepo = SeasonRepositoryImpl.getInstance();

  const competitionIdExpr = seedData.seasons.current.competition.id;
  const context = { bson: bson };
  vm.createContext(context);
  const competitionId = vm.runInContext(
    competitionIdExpr.substring(1),
    context
  ) as ObjectId;

  const currentSeasonSlug = seedData.seasons.current.slug;
  console.log(`Checking if season ${currentSeasonSlug} exists...`);
  const seasonExists = await lastValueFrom(
    seasonRepo.exists$({
      'competition.id': competitionId,
      slug: currentSeasonSlug,
    })
  );
  return Promise.resolve(seasonExists);
}

async function main() {
  await connect();
  const seeder = mongooseSeeder(mongoose.connection);
  for (const data of [seedData2425, seedData2526]) {
    const isSeeded = await defaultDataExists(data);
    if (isSeeded) {
      console.log(
        `Default data for ${data.seasons.current.slug} already exists, skipping seeding.`
      );
      continue;
    }
    console.log('seeding data for ', data.seasons.current.slug);
    await seeder.seed(data, {
      dropCollections: false,
      dropDatabase: false,
    });
  }

  console.log('seeding done');
  await mongoose.connection.close();
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
  process.exit(1);
});
