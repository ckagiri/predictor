import CompetitionModel from './models/competition.model.js';
import GameRoundModel from './models/gameRound.model.js';
import LeaderboardModel from './models/leaderboard.model.js';
import MatchModel from './models/match.model.js';
import PredictionModel from './models/prediction.model.js';
import SeasonModel from './models/season.model.js';
import TeamModel from './models/team.model.js';
import UserModel from './models/user.model.js';
import UserScoreModel from './models/userScore.model.js';

export default {
  Competition: CompetitionModel,
  GameRound: GameRoundModel,
  Leaderboard: LeaderboardModel,
  Match: MatchModel,
  Prediction: PredictionModel,
  Season: SeasonModel,
  Team: TeamModel,
  User: UserModel,
  UserScore: UserScoreModel,
};
