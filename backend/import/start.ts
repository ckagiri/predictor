import { apiFootballDataImporter } from "./apiFootballData/start";
import { config } from "../config/environment/index";
import * as db from "../db/index";
function start() {
  db.init(config.mongo.uri, (err: any) => {
    if (err === null) {
      apiFootballDataImporter.start();
    }
  });
}

start();
