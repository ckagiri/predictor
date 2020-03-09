import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import setup from './frontendMiddleware';
import * as http from 'http';
import routes from './api/routes';

async function startServer(): Promise<http.Server> {
  if (!process.env.NODE_ENV || !process.env.PORT || !process.env.MONGO_URI) {
    console.error(
      'ENV variables are missing.',
      'Verify that you have set them directly or in a .env file.',
    );
    process.exit(1);
  } else {
    console.log('Using ENV variables');
  }

  const port = process.env.PORT;
  const mongoUri = process.env.MONGO_URI;
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use('/api', routes);

  // setup(app, {
  //   outputPath: resolve(process.cwd(), '../dist'),
  //   publicPath: '/',
  // });

  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;

    db.on('error', (err: Error) => {
      console.error(`ERROR CONNECTING TO MONGO: ${err}`);
      console.error(`Please make sure that ${mongoUri} is running.`);
    });

    db.once('open', () => {
      console.info(`Connected to MongoDB: ${mongoUri}`);
    });
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
