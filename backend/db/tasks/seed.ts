import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose from 'mongoose';

import CompetitionModel from '../models/competition.model.js';
import GameRoundModel from '../models/gameRound.model.js';
import LeaderboardModel from '../models/leaderboard.model.js';
import MatchModel from '../models/match.model.js';
import PredictionModel from '../models/prediction.model.js';
import SeasonModel from '../models/season.model.js';
import TeamModel from '../models/team.model.js';
import UserModel from '../models/user.model.js';
import UserScoreModel from '../models/userScore.model.js';
import seedData from '../tasks/seedData/seed-epl24.json';

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

async function connectWithRetry() {
  const dbUri =
    process.env.MONGO_URI ?? 'mongodb://localhost:27017/ligipredictor_test';
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

async function main() {
  await connectWithRetry();
  const seeder = mongooseSeeder(mongoose);
  console.log('seeding db..');
  await seeder.seed(seedData, { dropCollections: false, dropDatabase: false });
  console.log('seeding done');
  await mongoose.connection.close();
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
});
