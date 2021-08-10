const path = require('path');
const pathBase = path.resolve(__dirname, '../..');
const base = (...paths) => path.resolve(pathBase, ...paths);
const fromBase = (...paths) => (...subPaths) => base(...paths, ...subPaths);
const fromFrontendDir = fromBase('frontend');
const fromDistDir = fromBase('dist');

const config = {
  frontendDir: fromFrontendDir(''),
  fromFrontendDir,
  distDir: fromDistDir(''),
  fromDistDir,
};

module.exports = config;
