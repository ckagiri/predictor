/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Seeder } from './seeder';

async function main() {
  const {
    MONGO_DB,
    MONGO_HOSTNAME,
    MONGO_PASSWORD,
    MONGO_PORT,
    MONGO_USERNAME,
  } = process.env;

  const dbUri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
  const seeder = Seeder.getInstance(dbUri);
  await seeder.init();
  await seeder.seed();
  await seeder.close();
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
});
