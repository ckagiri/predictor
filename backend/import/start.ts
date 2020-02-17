import { apiFootballDataImporter } from './apiFootballData/start';
import * as db from '../db/index';

function start() {
  db.init(process.env.MONGO_URI!, (err: any) => {
    if (err === null) {
      apiFootballDataImporter.start();
    }
  });
}

start();
