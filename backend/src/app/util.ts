import path from 'path';

const pathBase = path.resolve(__dirname, '../..');
const base = (...paths: string[]) => path.resolve(pathBase, ...paths);
export const fromBase =
  (...paths: string[]) =>
  (...subPaths: string[]) =>
    base(...paths, ...subPaths);
