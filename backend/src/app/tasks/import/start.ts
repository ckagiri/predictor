import getDbUri from '../../../common/getDbUri.js';
import * as db from '../../../db/index.js';
import { apiFootballDataImporter } from './apiFootballData/start.js';

function start() {
  const dbUri = getDbUri();
  db.init(dbUri, (err: any) => {
    if (err === null) {
      apiFootballDataImporter.start();
    }
  });
}

start();
