import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';

let mongoServer: MongoMemoryServer;

const mongooseOpts = {
  dbName: 'ligipredictor',
} as ConnectOptions;

const connect = async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, mongooseOpts);
};

const dropDb = async () => {
  await mongoose.connection.dropDatabase();
};

const close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export default {
  close,
  connect,
  dropDb,
};
