import { config } from '../../config/environment/index';
import seedData from '../tasks/seedData/seed-leagues.json';

import mongooseSeeder = require('mais-mongoose-seeder');
import mongoose = require('mongoose');
import('../models/league.model');

function seed() {
  mongoose.connect(config.mongo.uri, { useNewUrlParser: true });
  mongoose.connection.on('open', () => {
    const seeder = mongooseSeeder(mongoose);
    console.log('seeding db..');
    seeder.seed(seedData, { dropDatabase: true, dropCollections: true })
      .then(function(dbData: any) {
        // The database objects are stored in dbData
      }).catch(function(err: any) {
        console.log(err);
      })
      .then(function() {
        mongoose.connection.close();
        console.log('seeding done');
      });
  });
}

seed();