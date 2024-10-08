import mongoose, { ConnectOptions } from 'mongoose';

function drop() {
  // tslint:disable-next-line:no-console
  console.log('dropping db..');
  mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions);
  mongoose.connection.on('open', () => {
    mongoose.connection.dropDatabase().then(() => {
      mongoose.connection.close();
      // tslint:disable-next-line:no-console
      console.log('db dropped');
    });
  });
}

drop();
