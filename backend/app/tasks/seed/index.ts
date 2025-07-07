import { Seeder } from './seeder';

async function main() {
  const dbUri =
    'mongodb://ckagiri:notasecret@127.0.0.1:27017/ligipredictor_test?authSource=admin';
  const seeder = Seeder.getInstance(dbUri);
  await seeder.init();
  await seeder.seed();
  await seeder.close();
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
});
