
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
const mongod = new MongoMemoryServer();

export const connect = async () => {
  const uri = await mongod.getConnectionString();

  const mongooseOpts = {
    useUnifiedTopology: true,
    useNewUrlParser: true
  };

  await mongoose.connect(uri, mongooseOpts);
}

export const close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export default {
  connect,
  close
}
