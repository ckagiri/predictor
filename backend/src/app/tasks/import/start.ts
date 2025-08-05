import mongoose from 'mongoose';

import getDbUri from '../../../common/getDbUri.js';
import * as db from '../../../db/index.js';
import { apiFootballDataImporter } from './apiFootballData/start.js';

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

async function main() {
  await connect();
  apiFootballDataImporter.start(() => {
    console.log('ApiFootballData imported successfully');
    process.exit(0);
  });
}

(async () => {
  await main();
})().catch((err: unknown) => {
  console.error('Unhandled error in main:', err);
  process.exit(1);
});
