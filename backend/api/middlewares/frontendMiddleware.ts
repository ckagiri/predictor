import express, { Application, Request, Response } from 'express';
import path from 'path';
import compression from 'compression';
import { Configuration as WebpackConfig } from 'webpack';

interface SetupOptions {
  publicPath: string;
  outputPath: string;
}

/**
 * Front-end middleware
 */
export default (app: Application, options: SetupOptions) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    addProdMiddlewares(app, options);
  } else {
    const filePath = path.resolve(process.cwd(), '../frontend/webpack/webpack.client.dev');
    const webpackConfig = require(filePath) as WebpackConfig;
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};

function addDevMiddlewares(app: Application, webpackConfig: WebpackConfig) {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig!.output!.publicPath,
    silent: true,
    stats: 'errors-only',
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  app.get('*', (req, res) => {
    fs.readFile(
      path.join(compiler.outputPath, 'index.html'),
      (err: Error | null, file?: any) => {
        if (err) {
          res.sendStatus(404);
        } else {
          res.send(file.toString());
        }
      },
    );
  });
}

// Production middlewares
function addProdMiddlewares(app: Application, options: SetupOptions) {
  const publicPath = options.publicPath || '/';
  const outputPath = options.outputPath || path.resolve(process.cwd(), '../dist');

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());
  app.use(publicPath, express.static(outputPath));

  app.get('*', (_req: Request, res: Response) =>
    res.sendFile(path.resolve(outputPath, 'index.html')),
  );
}

// use the gzipped bundle
// app.get('*.js', (req, res, next) => {
//   req.url = req.url + '.gz'; // eslint-disable-line
//   res.set('Content-Encoding', 'gzip');
//   next();
// });
