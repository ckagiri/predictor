import mongoose = require('mongoose');
import CompetitionModel from './models/competition.model';
import TeamModel from './models/team.model';
import PredictionModel from './models/prediction.model';
import SeasonModel from './models/season.model';

export const init = (
  mongoUri: string,
  cb?: any,
  options: any = { drop: false },
) => {
  cb =
    cb ||
    (() => {
      /**/
    });
  mongoose.connect(mongoUri, { useNewUrlParser: true }, (error: any) => {
    if (options.drop) {
      mongoose.connection.db.dropDatabase((err: any) => {
        cb(err);
      });
    } else {
      cb(error);
    }
  });
};

export const drop = () => {
  return mongoose.connection.db.dropDatabase();
};

export const close = () => {
  return mongoose.connection.close();
};

export default {
  init,
  drop,
  close,
  Competition: CompetitionModel,
  Season: SeasonModel,
  Team: TeamModel,
  Prediction: PredictionModel
}
