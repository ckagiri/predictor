import mongoose, { ConnectOptions } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

const mongooseOpts = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  dbName: 'ligipredictor'
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
  connect,
  dropDb,
  close,
};
