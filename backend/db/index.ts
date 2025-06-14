import mongoose, { ConnectOptions } from 'mongoose';

import CompetitionModel from './models/competition.model.js';
import GameRoundModel from './models/gameRound.model.js';
import LeaderboardModel from './models/leaderboard.model.js';
import MatchModel from './models/match.model.js';
import PredictionModel from './models/prediction.model.js';
import SeasonModel from './models/season.model.js';
import TeamModel from './models/team.model.js';
import UserModel from './models/user.model.js';
import UserScoreModel from './models/userScore.model.js';

export const init = (
  mongoUri: string,
  cb?: any,
  options: any = { drop: false }
) => {
  cb =
    cb ??
    (() => {
      /**/
    });
  mongoose
    .connect(mongoUri, { useNewUrlParser: true } as ConnectOptions)
    .then(async () => {
      if (options.drop) {
        if (mongoose.connection.db) {
          try {
            await mongoose.connection.db.dropDatabase();
            cb();
          } catch (err) {
            cb(err);
          }
        } else {
          cb(new Error('Database connection is not established.'));
        }
      } else {
        cb();
      }
    })
    .catch((error: unknown) => {
      cb(error);
    });
};

export const drop = () => {
  if (!mongoose.connection.db) {
    return Promise.reject(new Error('Database connection is not established.'));
  }
  return mongoose.connection.db.dropDatabase();
};

export const close = () => {
  return mongoose.connection.close();
};

export default {
  close,
  Competition: CompetitionModel,
  drop,
  GameRound: GameRoundModel,
  init,
  Leaderboard: LeaderboardModel,
  Match: MatchModel,
  Prediction: PredictionModel,
  Season: SeasonModel,
  Team: TeamModel,
  User: UserModel,
  UserScore: UserScoreModel,
};
