import bson from 'bson';
import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose from 'mongoose';
import { lastValueFrom } from 'rxjs';
import vm from 'vm';

import getDbUri from '../../common/getDbUri.js';
import { GameRound } from '../models/index.js';
import {
  CompetitionRepositoryImpl,
  GameRoundRepositoryImpl,
  SeasonRepositoryImpl,
} from '../repositories/index.js';
import seedData2425 from './seedData/seed-2024-25.json';
import seedData2526 from './seedData/seed-2025-26.json';

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

const competitionRepo = CompetitionRepositoryImpl.getInstance();
const seasonRepo = SeasonRepositoryImpl.getInstance();
const roundRepo = GameRoundRepositoryImpl.getInstance();

async function connect() {
  const dbUri = getDbUri();
  console.info(`Connecting to MongoDB at ${dbUri}`);
  try {
    await mongoose.connect(dbUri);
    console.info(`Connected to MongoDB: ${dbUri}`);
  } catch (err: unknown) {
    console.error(`ERROR CONNECTING TO MONGO: ${String(err)}`);
    console.error(`Please make sure that ${dbUri} is running.`);
  }
}

const getObjectId = (idExpression: string): mongoose.Types.ObjectId => {
  const context = { bson: bson };
  vm.createContext(context);
  const id = vm.runInContext(idExpression.substring(1), context);
  const objectId = mongoose.Types.ObjectId.createFromHexString(id.toString());
  return objectId;
};

async function defaultDataExists(seedData: SeedDataPartial) {
  const competitionIdExpr = seedData.seasons.current.competition.id;
  const competitionId = getObjectId(competitionIdExpr);

  const currentSeasonSlug = seedData.seasons.current.slug;
  console.log('Checking if season exists...');
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

  const seeds = [seedData2425, seedData2526];
  const seeder = mongooseSeeder(mongoose.connection);
  for (let index = 0; index < seeds.length; index++) {
    const data = seeds[index];
    const competition = data.seasons.current.competition.slug;
    const season = data.seasons.current.slug;
    const competitionSeason = `${competition}_${season}`;

    console.log(`Seeding data for ${competitionSeason}`);
    const isSeeded = await defaultDataExists(data);
    if (isSeeded) {
      console.log(
        `Default data for ${competitionSeason} already exists, skipping seeding.`
      );
      continue;
    }

    console.log('Seeding data...');
    await seeder.seed(data, {
      dropCollections: false,
      dropDatabase: false,
    });
    const isLast = index === seeds.length - 1;
    await setCompetitionSeasonDefaults(data, isLast);
  }

  console.log('Seeding done!');
  await mongoose.connection.close();
}

async function setCompetitionSeasonDefaults(
  seedData: SeedDataPartial,
  isLast: boolean
) {
  const competitionIdExpr = seedData.seasons.current.competition.id;
  const competitionId = getObjectId(competitionIdExpr);
  const currentSeasonSlug = seedData.seasons.current.slug;
  const currentSeason = await lastValueFrom(
    seasonRepo.findOne$({
      'competition.id': competitionId,
      slug: currentSeasonSlug,
    })
  );

  if (isLast) {
    await lastValueFrom(
      competitionRepo.findByIdAndUpdate$(competitionId, {
        currentSeason: currentSeason?.id,
      })
    );
  }

  const rounds = await lastValueFrom(
    roundRepo.findAll$({ season: currentSeason?.id }, null, {
      sort: { position: 1 },
    })
  );
  let currentRound: GameRound | undefined;
  if (isLast) {
    currentRound = rounds[0];
  } else {
    currentRound = rounds[rounds.length - 1];
  }
  await lastValueFrom(
    seasonRepo.findByIdAndUpdate$(currentSeason?.id!, {
      currentGameRound: currentRound.id,
      currentMatchday: currentRound.position!.toString(),
    })
  );
}

main().catch((err: unknown) => {
  console.error(`ERROR SEEDING DB: ${String(err)}`);
  process.exit(1);
});
