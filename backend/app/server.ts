import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { ConnectOptions } from 'mongoose';
import passport from 'passport'
import * as http from 'http';

import { getLocalStrategy } from './api/auth/passport';
import errorMiddleware from './api/auth/error.middleware';
import router from './api/routes';

async function startServer({ port = process.env.PORT } = {}): Promise<http.Server> {
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
