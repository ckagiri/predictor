import bodyParser from 'body-parser';
import cp from 'child_process';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import mongoose from 'mongoose';
import passport from 'passport';

import errorMiddleware from './api/auth/error.middleware.js';
import { getLocalStrategy } from './api/auth/passport.js';
import router from './api/routes.js';
import isDocker from './isDocker.js';
import { fromBase } from './util.js';

async function startServer({ port = process.env.PORT } = {}): Promise<Server> {
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
    typeof process.env._ === 'string' && process.env._.includes('tsx');
  console.log('isTsx', isTsx);
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV !== 'test') {
    const fromBuildDir = fromBase('build');
    const fromBackendDir = fromBase('backend');
    const fromSrcDir = fromBase('src');
    if (isDocker()) {
      if (isTsx) {
        node2 = cp.fork(fromSrcDir('app', 'schedulers', 'app_FORK.ts'), [], {
          execArgv: ['--import', 'tsx'],
        });
      } else {
        node2 = cp.fork(fromBuildDir('app', 'schedulers', 'app_FORK.js'), []);
      }
    } else if (isTsx) {
      console.log('waith');
      node2 = cp.fork(fromBackendDir('app', 'schedulers', 'app_FORK.ts'), [], {
        execArgv: ['--import', 'tsx'],
      });
    }
  }
  app.use(function (req: any, _res, next) {
    req.node2 = node2;
    next();
  });

  app.use(passport.initialize());
  passport.use(getLocalStrategy());
  app.use('/api', router);
  app.use(errorMiddleware);

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI ENV variable missing');
    process.exit(1);
  }
  const dbUri = process.env.MONGO_URI;

  await connectWithRetry();

  async function connectWithRetry() {
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

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
      const originalClose = server.close.bind(server);
      // @ts-expect-error: Overriding server.close to return a Promise for graceful shutdown
      server.close = () => {
        return new Promise(resolveClose => {
          originalClose(resolveClose);
        });
      };

      resolve(server);
    });
  });
}

export default startServer;
