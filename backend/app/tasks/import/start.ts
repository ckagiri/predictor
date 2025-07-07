import * as db from '../../../db/index.js';
import { apiFootballDataImporter } from './apiFootballData/start.js';

function start() {
  db.init(process.env.MONGO_URI!, (err: any) => {
    if (err === null) {
      apiFootballDataImporter.start();
    }
  });
}

start();
