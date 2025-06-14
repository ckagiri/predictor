import mongooseSeeder from 'mais-mongoose-seeder';
import mongoose, { ConnectOptions } from 'mongoose';

import seedData from '../tasks/seedData/seed-epl24.json';

function seed() {
  void mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
  } as ConnectOptions);
  mongoose.connection.on('open', () => {
    const seeder = mongooseSeeder(mongoose);
    console.log('seeding db..');
    seeder
      .seed(seedData, { dropCollections: true, dropDatabase: true })
      .then(() => {
        /**/
      })
      .catch((err: any) => {
        console.log(err);
      })
      .then(() => {
        void mongoose.connection.close();
        console.log('seeding done');
      });
  });
}

seed();
