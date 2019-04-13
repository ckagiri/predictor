import { config } from '../../config/environment/index';
import seedData from '../tasks/seedData/seed-leagues.json';

import mongooseSeeder = require('mais-mongoose-seeder');
import mongoose = require('mongoose');
import('../models/league.model');

function seed() {
  mongoose.connect(config.mongo.uri, { useNewUrlParser: true });
  mongoose.connection.on('open', () => {
    const seeder = mongooseSeeder(mongoose);
    // tslint:disable-next-line:no-console
    console.log('seeding db..');
    seeder.seed(seedData, { dropDatabase: true, dropCollections: true })
      .then((dbData: any) => {/**/})
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