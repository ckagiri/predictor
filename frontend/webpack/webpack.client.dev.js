const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const config = require('./config');

module.exports = require('./webpack.client.base')({
  mode: 'development',

  // Add hot reloading in development
  entry: [
    require.resolve('react-app-polyfill/ie11'),
    'webpack-hot-middleware/client?reload=true',
    config.fromFrontendDir('index.js'),
  ],

  // Don't use hashes in dev mode for better performance
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  // Add development plugins
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new HtmlWebpackPlugin({
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
      template: config.fromFrontendDir('index.html'),
    }),
    // new CircularDependencyPlugin({
    //   exclude: /a\.js|node_modules/, // exclude node_modules
    //   failOnError: false, // show a warning when there is a circular dependency
    // }),
  ],

  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'cheap-module-source-map',

  performance: {
    hints: false,
  },
});
