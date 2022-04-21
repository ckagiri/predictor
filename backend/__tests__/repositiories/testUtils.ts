import { MatchStatus, Match } from '../../db/models/match.model';
import { User } from '../../db/models/user.model';
import { Competition } from '../../db/models/competition.model';
import { Season } from '../../db/models/season.model';
import { GameRound } from '../../db/models/gameRound.model';
import { Team } from '../../db/models/team.model';
import { Prediction } from '../../db/models/prediction.model';
import {
  Leaderboard,
  BOARD_TYPE,
  BOARD_STATUS,
} from '../../db/models/leaderboard.model';
import { ScorePoints, Score } from '../../common/score';

const league: Competition = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'league',
};

const season: Season = {
  name: '2018-19',
  slug: '18-19',
  year: 2019,
  seasonStart: '2018-08-11T00:00:00+0200',
  seasonEnd: '2019-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
};

const gameRound: GameRound = {
  name: 'Gameweek 1',
  position: 1
};

const team1: Team = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const team2: Team = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_City_FC.svg',
  aliases: ['ManCity'],
};

const team3: Team = {
  name: 'Chelsea FC',
  shortName: 'Chelsea',
  code: 'CHE',
  slug: 'chelsea',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
  aliases: ['Chelsea'],
};

const team4: Team = {
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  code: 'ARS',
  slug: 'arsenal',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
  aliases: ['Arsenal'],
};

const team1Vteam2: Partial<Match> = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.SCHEDULED,
  allPredictionPointsUpdated: false,
  result: {
    goalsHomeTeam: 0,
    goalsAwayTeam: 0,
  },
};

const team3Vteam4: Partial<Match> = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.FINISHED,
  allPredictionPointsUpdated: false,
  result: {
    goalsHomeTeam: 2,
    goalsAwayTeam: 1,
  },
};

const user1: User = {
  username: 'user1',
  email: 'user1@example.com',
};

const user2: User = {
  username: 'user2',
  email: 'user2@example.com',
};

const user1_team1Vteam2: Partial<Prediction> = {
  choice: {
    goalsHomeTeam: 1,
    goalsAwayTeam: 0,
    isComputerGenerated: false,
  },
};

const user1_team1Vteam2_points: ScorePoints = {
  points: 4,
  APoints: 0,
  BPoints: 4,
  CorrectMatchOutcomePoints: 0,
  ExactGoalDifferencePoints: 0,
  ExactMatchScorePoints: 0,
  CloseMatchScorePoints: 1,
  ExactTeamScorePoints: 1,
};

const user1_team3Vteam4: Partial<Prediction> = {
  choice: {
    goalsHomeTeam: 2,
    goalsAwayTeam: 0,
    isComputerGenerated: false,
  },
};

const user1_team3Vteam4_points: ScorePoints = {
  points: 9,
  APoints: 5,
  BPoints: 4,
  CorrectMatchOutcomePoints: 5,
  ExactGoalDifferencePoints: 0,
  ExactMatchScorePoints: 0,
  CloseMatchScorePoints: 1,
  ExactTeamScorePoints: 1,
};

const user2_team1Vteam2: Partial<Prediction> = {
  choice: {
    goalsHomeTeam: 2,
    goalsAwayTeam: 2,
    isComputerGenerated: true,
  },
};

const user2_team1Vteam2_points: ScorePoints = {
  points: 6,
  APoints: 6,
  BPoints: 0,
  CorrectMatchOutcomePoints: 5,
  ExactGoalDifferencePoints: 1,
  ExactMatchScorePoints: 0,
  CloseMatchScorePoints: 0,
  ExactTeamScorePoints: 0,
};

const user2_team3Vteam4: Partial<Prediction> = {
  hasJoker: true,
  choice: {
    goalsHomeTeam: 2,
    goalsAwayTeam: 1,
    isComputerGenerated: false,
  },
};

const user2_team3Vteam4_points: ScorePoints = {
  points: 15,
  APoints: 11,
  BPoints: 4,
  CorrectMatchOutcomePoints: 5,
  ExactGoalDifferencePoints: 1,
  ExactMatchScorePoints: 5,
  CloseMatchScorePoints: 0,
  ExactTeamScorePoints: 2,
};

const season_board: Partial<Leaderboard> = {
  status: BOARD_STATUS.UPDATING_SCORES,
  boardType: BOARD_TYPE.GLOBAL_SEASON,
};

const round_board: Partial<Leaderboard> = {
  status: BOARD_STATUS.REFRESHED,
  boardType: BOARD_TYPE.GLOBAL_ROUND,
};

export interface TestUtils {
  user1: User;
  user2: User;
  league: Competition;
  season: Season;
  team1: Team;
  team2: Team;
  team3: Team;
  team4: Team;
  team1Vteam2: Match;
  team3Vteam4: Match;
  user1_team1Vteam2: Partial<Prediction>;
  user1_team3Vteam4: Partial<Prediction>;
  user2_team1Vteam2: Partial<Prediction>;
  user2_team3Vteam4: Partial<Prediction>;
  user1_team1Vteam2_points: ScorePoints;
  user1_team3Vteam4_points: ScorePoints;
  user2_team1Vteam2_points: ScorePoints;
  user2_team3Vteam4_points: ScorePoints;
  season_board: Leaderboard;
  round_board: Leaderboard;
}

export default {
  user1,
  user2,
  league,
  season,
  team1,
  team2,
  team3,
  team4,
  team1Vteam2,
  team3Vteam4,
  user1_team1Vteam2,
  user1_team3Vteam4,
  user2_team1Vteam2,
  user2_team3Vteam4,
  user1_team1Vteam2_points,
  user1_team3Vteam4_points,
  user2_team1Vteam2_points,
  user2_team3Vteam4_points,
  season_board,
  round_board,
} as TestUtils;
