import seedData from '../tasks/seedData/seed-epl23.json';

import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose, { ConnectOptions } from 'mongoose';
import('../models/competition.model');
import('../models/season.model');
import('../models/team.model');
import('../models/gameRound.model');

function seed() {
  mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true } as ConnectOptions);
  mongoose.connection.on('open', () => {
    const seeder = mongooseSeeder(mongoose);
    // tslint:disable-next-line:no-console
    console.log('seeding db..');
    seeder
      .seed(seedData, { dropDatabase: true, dropCollections: true })
      .then(() => {
        /**/
      })
      .catch((err: any) => {
        // tslint:disable-next-line:no-console
        console.log(err);
      })
      .then(() => {
        mongoose.connection.close();
        // tslint:disable-next-line:no-console
        console.log('seeding done');
      });
  });
}

seed();
