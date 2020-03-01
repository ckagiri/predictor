import { MatchStatus, MatchModel } from '../../db/models/match.model';
import { UserModel } from '../../db/models/user.model';
import { CompetitionModel } from '../../db/models/competition.model';
import { SeasonModel } from '../../db/models/season.model';
import { TeamModel } from '../../db/models/team.model';
import { PredictionModel } from '../../db/models/prediction.model';

const league: CompetitionModel = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'league',
};

const season: SeasonModel = {
  name: '2018-19',
  slug: '18-19',
  year: 2019,
  seasonStart: '2018-08-11T00:00:00+0200',
  seasonEnd: '2019-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: 20,
};

const team1: TeamModel = {
  name: 'Manchester United FC',
  shortName: 'Man United',
  code: 'MUN',
  slug: 'man_united',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_United_FC.svg',
  aliases: ['ManU', 'ManUtd'],
};

const team2: TeamModel = {
  name: 'Manchester City FC',
  shortName: 'Man City',
  code: 'MCI',
  slug: 'man_city',
  crestUrl:
    'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_City_FC.svg',
  aliases: ['ManCity'],
};

const team3: TeamModel = {
  name: 'Chelsea FC',
  shortName: 'Chelsea',
  code: 'CHE',
  slug: 'chelsea',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
  aliases: ['Chelsea'],
};

const team4: TeamModel = {
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  code: 'ARS',
  slug: 'arsenal',
  crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
  aliases: ['Arsenal'],
};

const team1Vteam2: Partial<MatchModel> = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.SCHEDULED,
  matchRound: 20,
  gameRound: 20,
  allPredictionsProcessed: false,
};

const team3Vteam4: Partial<MatchModel> = {
  date: '2018-09-10T11:30:00Z',
  status: MatchStatus.FINISHED,
  matchRound: 20,
  gameRound: 20,
  allPredictionsProcessed: false,
};

const user1: UserModel = {
  username: 'user1',
  email: 'user1@example.com',
};

const user2: UserModel = {
  username: 'user2',
  email: 'user2@example.com',
};

const user1_team1Vteam2: Partial<PredictionModel> = {
  choice: {
    goalsHomeTeam: 1,
    goalsAwayTeam: 0,
    isComputerGenerated: false,
  },
};

const user1_team3Vteam4: Partial<PredictionModel> = {
  choice: {
    goalsHomeTeam: 2,
    goalsAwayTeam: 1,
  },
};

const user2_team1Vteam2: Partial<PredictionModel> = {
  choice: {
    goalsHomeTeam: 3,
    goalsAwayTeam: 0,
    isComputerGenerated: false,
  },
};

const user2_team3Vteam4: Partial<PredictionModel> = {};

export interface TestUtils {
  user1: UserModel;
  user2: UserModel;
  league: CompetitionModel;
  season: SeasonModel;
  team1: TeamModel;
  team2: TeamModel;
  team3: TeamModel;
  team4: TeamModel;
  team1Vteam2: MatchModel;
  team3Vteam4: MatchModel;
  user1_team1Vteam2: Partial<PredictionModel>;
  user1_team3Vteam4: Partial<PredictionModel>;
  user2_team1Vteam2: Partial<PredictionModel>;
  user2_team3Vteam4: Partial<PredictionModel>;
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
} as TestUtils;
