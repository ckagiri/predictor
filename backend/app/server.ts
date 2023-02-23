import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { ConnectOptions } from 'mongoose';
import passport from 'passport'
import { Server } from 'http';
import cp from 'child_process';
import cors from 'cors'

import isDocker from './isDocker';
import { fromBase } from './util';
import { getLocalStrategy } from './api/auth/passport';
import errorMiddleware from './api/auth/error.middleware';
import router from './api/routes';

async function startServer({ port = process.env.PORT } = {}): Promise<Server> {
  if (!process.env.NODE_ENV || !port) {
    console.error(
      'NODE_ENV ENV variable or port missing.',
      'Verify that you have set them directly or in a .env file.',
    );
    process.exit(1);
  } else {
    console.log('Using NODE_ENV', process.env.NODE_ENV);
  }

  const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
    LOCAL_MONGO
  } = process.env;
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // Fire up the child process that will run in a separate machine core
  // and do some background processing. This way, this master process can
  // be freed up to keep processing to a minimum on its servicing threads.
  let node2: cp.ChildProcess;
  if (process.env.NODE_ENV !== 'test') {
    const fromBuildDir = fromBase('build')
    const fromBackendDir = fromBase('backend')
    const fromSrcDir = fromBase('src');
    // @ts-ignore // check if code is running under ts-node or docker
    if (process[Symbol.for("ts-node.register.instance")]) {
      node2 = cp.fork(fromBackendDir('app', 'schedulers', 'app_FORK.ts'), [], { execArgv: ['-r', 'ts-node/register'] })
    } else if (isDocker()) {
      node2 = cp.fork(fromSrcDir('app', 'schedulers', 'app_FORK.js'), []);
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
  app.use(errorMiddleware);

  if (process.env.NODE_ENV === 'prod') {
    const www = process.env.WWW || './public';
    app.use(express.static(www));
    app.get('*', (_req, res) => {
      res.sendFile(`index.html`, { root: www });
    });
  }

  const mongoOnAtlasUri = `mongodb+srv://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD!)}@${MONGO_HOSTNAME}/${MONGO_DB}?retryWrites=true&w=majority`;
  const mongoUri = `mongodb://${LOCAL_MONGO}:${MONGO_PORT}/${MONGO_DB}`;
  let dbUri = '';

  console.log(`process.env.DATA_OPTION=${process.env.DATA_OPTION}`);
  if (process.env.DATA_OPTION === 'local_mongo') {
    dbUri = mongoUri;
  } else if (process.env.DATA_OPTION === 'cloud_mongo') {
    dbUri = mongoOnAtlasUri;
  } else {
    console.error('DATA_OPTION ENV variable missing',);
    process.exit(1);
  }

  await connectWithRetry();

  async function connectWithRetry() {
    try {
      await mongoose.connect(
        dbUri,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as ConnectOptions);
      console.info(`Connected to MongoDB: ${dbUri}`);
    } catch (err: any) {
      console.error(`ERROR CONNECTING TO MONGO: ${err}`);
      console.error(`Please make sure that ${dbUri} is running.`);

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(5000);
      await connectWithRetry()
    }
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
