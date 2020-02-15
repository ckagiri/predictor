import mongoose = require('mongoose');
import { config } from '../../config/environment/index';

function drop() {
  // tslint:disable-next-line:no-console
  console.log('dropping db..');
  mongoose.connect(config.mongo.uri, { useNewUrlParser: true });
  mongoose.connection.on('open', () => {
    mongoose.connection.dropDatabase().then(() => {
      mongoose.connection.close();
      // tslint:disable-next-line:no-console
      console.log('db dropped');
    });
  });
}

drop();
