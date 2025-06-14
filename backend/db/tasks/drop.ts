import mongoose, { ConnectOptions } from 'mongoose';

function drop() {
  console.log('dropping db..');
  mongoose
    .connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .catch((err: unknown) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
  mongoose.connection.on('open', () => {
    mongoose.connection
      .dropDatabase()
      .then(() => {
        return mongoose.connection.close();
      })
      .then(() => {
        console.log('db dropped');
      })
      .catch((err: unknown) => {
        console.error('Error dropping database or closing connection:', err);
        process.exit(1);
      });
  });
}

drop();
