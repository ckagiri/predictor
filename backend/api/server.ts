import express from 'express';
import bodyParser from 'body-parser';
import setup from './middlewares/frontendMiddleware';
import { router } from './routes';
import { resolve } from 'path';

if (!process.env.NODE_ENV || !process.env.PORT) {
  console.error(
    'ENV variables are missing.',
    'Verify that you have set them directly or in a .env file.',
  );
  process.exit(1);
} else {
  console.log('Using ENV variables');
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', router);

setup(app, {
  outputPath: resolve(process.cwd(), 'dist'),
  publicPath: '/',
});

const port = process.env.PORT || 7070;
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
