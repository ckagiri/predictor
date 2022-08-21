import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { ConnectOptions } from 'mongoose';
import passport from 'passport'
import { Server } from 'http';
import path from 'path';
import cp from 'child_process';

import { getLocalStrategy } from './api/auth/passport';
import errorMiddleware from './api/auth/error.middleware';
import router from './api/routes';

async function startServer({ port = process.env.PORT } = {}): Promise<Server> {
  if (!process.env.NODE_ENV || !process.env.MONGO_URI) {
    console.error(
      'NODE_ENV or MONGO_URI ENV variables missing.',
      'Verify that you have set them directly or in a .env file.',
    );
    process.exit(1);
  } else {
    console.log('Using ENV variables');
  }

  const mongoUri = process.env.MONGO_URI;
  const app = express();
  app.use(bodyParser.json());

  const pathBase = path.resolve(__dirname, '../..');
  const base = (...paths: string[]) => path.resolve(pathBase, ...paths);
  const fromBase = (...paths: string[]) => (...subPaths: string[]) => base(...paths, ...subPaths);
  const fromBuildDir = fromBase('build')
  const fromBackendDir = fromBase('backend')

  // Fire up the child process that will run in a separate machine core
  // and do some background processing. This way, this master process can
  // be freed up to keep processing to a minimum on its servicing threads.
  let node2: cp.ChildProcess;
  if (process.env.NODE_ENV !== 'test') {
    // @ts-ignore // check if code is running under ts-node
    if (process[Symbol.for("ts-node.register.instance")]) {
      node2 = cp.fork(fromBackendDir('app', 'schedulers', 'app_FORK.ts'), [], { execArgv: ['-r', 'ts-node/register'] })
    } else {
      node2 = cp.fork(fromBuildDir('app', 'schedulers', 'app_FORK.js'), []);
    }
  }
  app.use(function (req: any, _res, next) {
    req.node2 = node2;
    next();
  });

  app.use(passport.initialize())
  passport.use(getLocalStrategy())
  app.use('/api', router);
  app.use(errorMiddleware)

  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    const db = mongoose.connection;

    db.on('error', (err: Error) => {
      console.error(`ERROR CONNECTING TO MONGO: ${err}`);
      console.error(`Please make sure that ${mongoUri} is running.`);
    });

    db.once('open', () => {
      console.info(`Connected to MongoDB: ${mongoUri}`);
    });
    console.info(`Connected to MongoDB: ${mongoUri}`);
  }

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
      const originalClose = server.close.bind(server);
      // @ts-ignore
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
