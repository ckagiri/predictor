import mongoose from 'mongoose';
import CompetitionModel from './models/competition.model';
import TeamModel from './models/team.model';
import PredictionModel from './models/prediction.model';
import SeasonModel from './models/season.model';
import LeaderboardModel from './models/leaderboard.model';
import UserModel from './models/user.model';
import UserScoreModel from './models/userScore.model';
import MatchModel from './models/match.model';
import GameRoundModel from './models/gameRound.model';

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
  User: UserModel,
  Competition: CompetitionModel,
  Season: SeasonModel,
  GameRound: GameRoundModel,
  Team: TeamModel,
  Match: MatchModel,
  Prediction: PredictionModel,
  Leaderboard: LeaderboardModel,
  UserScore: UserScoreModel,
};
