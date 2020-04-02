import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
const mongod = new MongoMemoryServer();

const connect = async () => {
  const uri = await mongod.getConnectionString();

  const mongooseOpts = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

const dropDb = async () => {
  await mongoose.connection.dropDatabase();
};

const close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export default {
  connect,
  dropDb,
  close,
};
