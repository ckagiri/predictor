import bodyParser from 'body-parser';
import cp from 'child_process';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';

import getDbUri from '../common/getDbUri.js';
import errorMiddleware from './api/auth/error.middleware.js';
import router from './api/routes.js';
import isDocker from './isDocker.js';
import { fromBase } from './util.js';

let server: Server | null = null;

export async function startWebServer({
  port = process.env.PORT,
} = {}): Promise<AddressInfo> {
  if (!process.env.NODE_ENV || !port) {
    console.error(
      'NODE_ENV ENV variable or port missing.',
      'Verify that you have set them directly or in a .env file.'
    );
    process.exit(1);
  } else {
    console.log('Using NODE_ENV', process.env.NODE_ENV);
  }

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // Fire up the child process that will run in a separate machine core
  // and do some background processing. This way, this master process can
  // be freed up to keep processing to a minimum on its servicing threads.
  let node2: cp.ChildProcess;
  const isTsx =
    (typeof process.env._ === 'string' && process.env._.includes('tsx')) ||
    process.env.EXECUTION_ENGINE === 'tsx';
  if (process.env.NODE_ENV !== 'test') {
    const fromSrcDir = fromBase('src');
    if (isDocker()) {
      if (isTsx) {
        node2 = cp.fork(fromSrcDir('app', 'schedulers', 'app_FORK.ts'), [], {
          execArgv: ['--import', 'tsx'],
        });
      } else {
        node2 = cp.fork(fromSrcDir('app', 'schedulers', 'app_FORK.js'), []);
      }
    } else {
      if (isTsx) {
        node2 = cp.fork(fromSrcDir('app', 'schedulers', 'app_FORK.ts'), [], {
          execArgv: ['--import', 'tsx'],
        });
      } else {
        const fromBuildDir = fromBase('build');
        node2 = cp.fork(fromBuildDir('app', 'schedulers', 'app_FORK.js'), []);
      }
    }
  }
  app.use(function (req: any, _res, next) {
    req.node2 = node2;
    next();
  });

  app.use('/api', router);
  app.use(errorMiddleware);

  await connectWithRetry();

  async function connectWithRetry() {
    const dbUri = getDbUri();
    try {
      if (
        mongoose.connection.readyState === mongoose.ConnectionStates.connected
      ) {
        const { host, name, port } = mongoose.connection;
        const mongoUri = `mongodb://${host}:${port}/${name}`;
        console.info(`Connected to MongoDB: ${mongoUri}`);
      } else {
        await mongoose.connect(dbUri);
        console.info(`Connected to MongoDB: ${dbUri}`);
      }
    } catch (err: any) {
      console.error(`ERROR CONNECTING TO MONGO: ${err}`);
      console.error(`Please make sure that ${dbUri} is running.`);

      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));
      await delay(5000);
      await connectWithRetry();
    }
  }

  return new Promise<AddressInfo>(resolve => {
    server = app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);

      resolve(server?.address() as AddressInfo);
    });
  });
}

export const stopWebServer = async () => {
  return new Promise<void>((resolve, _reject) => {
    if (server) {
      server.close(() => {
        resolve();
      });
    }
    resolve();
  });
};
