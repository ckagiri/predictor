import fs from 'fs';
import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose from 'mongoose';
import path from 'path';
import { lastValueFrom } from 'rxjs';

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
import seedData from './seedData/seed-epl.json';

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

async function defaultDataExists() {
  const seasonRepo = SeasonRepositoryImpl.getInstance();
  const dataPath = path.resolve(__dirname, './seedData/seed-epl.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Record<
    string,
    any
  >;
  const currentSeasonSlug = data.seasons?.current?.slug;
  const seasonExists = await lastValueFrom(
    seasonRepo.exists$({ slug: currentSeasonSlug })
  );
  return Promise.resolve(seasonExists);
}

async function main() {
  await connect();
  const isSeeded = await defaultDataExists();
  if (isSeeded) {
    console.log('Default data already exists, skipping seeding.');
    await mongoose.connection.close();
    return;
  }
  console.log('seeding default-data ...');
  const seeder = mongooseSeeder(mongoose.connection);
  await seeder.seed(seedData, { dropCollections: false, dropDatabase: false });
  console.log('seeding done');
  await mongoose.connection.close();
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
  process.exit(1);
});
