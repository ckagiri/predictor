// import { MatchStatus, Match } from '../../db/models/match.model';
// import { User } from '../../db/models/user.model';
// import { Competition } from '../../db/models/competition.model';
// import { Season } from '../../db/models/season.model';
// import { Team } from '../../db/models/team.model';
// import { Prediction } from '../../db/models/prediction.model';

// const league: Competition = {
//   name: 'English Premier League',
//   slug: 'english_premier_league',
//   code: 'league',
// };

// const season: Season = {
//   name: '2018-19',
//   slug: '18-19',
//   year: 2019,
//   seasonStart: '2018-08-11T00:00:00+0200',
//   seasonEnd: '2019-05-13T16:00:00+0200',
//   currentMatchRound: 20,
//   currentGameRound: 20,
// };

// const team1: Team = {
//   name: 'Manchester United FC',
//   shortName: 'Man United',
//   code: 'MUN',
//   slug: 'man_united',
//   crestUrl:
//     'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_United_FC.svg',
//   aliases: ['ManU', 'ManUtd'],
// };

// const team2: Team = {
//   name: 'Manchester City FC',
//   shortName: 'Man City',
//   code: 'MCI',
//   slug: 'man_city',
//   crestUrl:
//     'http://upload.wikimedia.org/wikipedia/de/d/da/Manteam3ster_City_FC.svg',
//   aliases: ['ManCity'],
// };

// const team3: Team = {
//   name: 'Chelsea FC',
//   shortName: 'Chelsea',
//   code: 'CHE',
//   slug: 'chelsea',
//   crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea_FC.svg',
//   aliases: ['Chelsea'],
// };

// const team4: Team = {
//   name: 'Arsenal FC',
//   shortName: 'Arsenal',
//   code: 'ARS',
//   slug: 'arsenal',
//   crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
//   aliases: ['Arsenal'],
// };

// const team1Vteam2: Partial<Match> = {
//   date: '2018-09-10T11:30:00Z',
//   status: MatchStatus.SCHEDULED,
//   matchRound: 20,
//   gameRound: 20,
//   allPredictionPointsUpdated: false,
// };

// const team3Vteam4: Partial<Match> = {
//   date: '2018-09-10T11:30:00Z',
//   status: MatchStatus.FINISHED,
//   matchRound: 20,
//   gameRound: 20,
//   allPredictionPointsUpdated: false,
// };

// const user1: User = {
//   username: 'user1',
//   email: 'user1@example.com',
// };

// const user2: User = {
//   username: 'user2',
//   email: 'user2@example.com',
// };

// const user1_team1Vteam2: Partial<Prediction> = {
//   choice: {
//     goalsHomeTeam: 1,
//     goalsAwayTeam: 0,
//     isComputerGenerated: false,
//   },
// };

// const user1_team3Vteam4: Partial<Prediction> = {
//   choice: {
//     goalsHomeTeam: 2,
//     goalsAwayTeam: 1,
//   },
// };

// const user2_team1Vteam2: Partial<Prediction> = {
//   choice: {
//     goalsHomeTeam: 3,
//     goalsAwayTeam: 0,
//     isComputerGenerated: false,
//   },
// };

// const user2_team3Vteam4: Partial<Prediction> = {};

// export interface TestUtils {
//   user1: User;
//   user2: User;
//   league: Competition;
//   season: Season;
//   team1: Team;
//   team2: Team;
//   team3: Team;
//   team4: Team;
//   team1Vteam2: Match;
//   team3Vteam4: Match;
//   user1_team1Vteam2: Partial<Prediction>;
//   user1_team3Vteam4: Partial<Prediction>;
//   user2_team1Vteam2: Partial<Prediction>;
//   user2_team3Vteam4: Partial<Prediction>;
// }

// export default {
//   user1,
//   user2,
//   league,
//   season,
//   team1,
//   team2,
//   team3,
//   team4,
//   team1Vteam2,
//   team3Vteam4,
//   user1_team1Vteam2,
//   user1_team3Vteam4,
//   user2_team1Vteam2,
//   user2_team3Vteam4,
// } as TestUtils;
