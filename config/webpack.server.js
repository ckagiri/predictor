const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const CURRENT_WORKING_DIR = process.cwd();

module.exports = {
  name: 'server',
  entry: [path.join(CURRENT_WORKING_DIR, '/backend/api/server.ts')],
  target: 'node',
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/backend/build'),
    filename: 'server.generated.js',
    publicPath: '/backend/build',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ tsconfig: './backend/tsconfig.json' }),
  ],
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};
