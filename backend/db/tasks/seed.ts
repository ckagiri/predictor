import seedData from '../tasks/seedData/seed-epl19.json';

import mongooseSeeder = require('mais-mongoose-seeder');
import mongoose = require('mongoose');
import('../models/competition.model');
import('../models/season.model');
import('../models/team.model');

function seed() {
  mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true });
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
