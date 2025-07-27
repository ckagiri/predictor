import { lastValueFrom } from 'rxjs';

import { LeaderboardProcessorImpl } from '../../../app/schedulers/leaderboard.processor';
import { PredictionProcessorImpl } from '../../../app/schedulers/prediction.processor';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { MatchStatus } from '../../../db/models/match.model';
import { LeaderboardRepositoryImpl } from '../../../db/repositories/leaderboard.repo';
import { UserScoreRepositoryImpl } from '../../../db/repositories/userScore.repo';
import a from '../../a';
import memoryDb from '../../memoryDb';

const leaderboardProcessor = LeaderboardProcessorImpl.getInstance();
const leaderboardRepo = LeaderboardRepositoryImpl.getInstance();
const userScoreRepo = UserScoreRepositoryImpl.getInstance();
const predictionProcessor = PredictionProcessorImpl.getInstance();

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2021 = a.season
  .withCompetition(epl)
  .setName('2021-2022')
  .setSlug('2021-22')
  .setYear(2022)
  .setSeasonStart('2021-08-09T00:00:00+0200')
  .setSeasonEnd('2022-05-17T16:00:00+0200')
  .setExternalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  });

const team1 = a.team.setName('Team 1').setSlug('team-1');
const team2 = a.team.setName('Team 2').setSlug('team-2');
const team3 = a.team.setName('Team 3').setSlug('team-3');
const team4 = a.team.setName('Team 4').setSlug('team-4');

const gw1 = a.gameRound
  .setName('Gameweek 1')
  .setSlug('gameweek-1')
  .setPosition(1);
const gw2 = a.gameRound
  .setName('Gameweek 2')
  .setSlug('gameweek-2')
  .setPosition(2);

const user1 = a.user.setUsername('charles');
const user2 = a.user.setUsername('kagiri');

const team1Vteam2User1Pred = a.prediction
  .withUser(user1)
  .setHomeScore(2)
  .setAwayScore(0)
  .setJoker(true);

const team1Vteam2User2Pred = a.prediction
  .withUser(user2)
  .setHomeScore(4)
  .setAwayScore(0)
  .setJoker(true);

const team1Vteam2 = a.match
  .withHomeTeam(team1)
  .withAwayTeam(team2)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .withPredictions(team1Vteam2User1Pred, team1Vteam2User2Pred)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(3)
  .setAwayScore(1);

const team3Vteam4User1 = a.prediction
  .withUser(user1)
  .setHomeScore(2)
  .setAwayScore(1);

const team3Vteam4User2 = a.prediction
  .withUser(user2)
  .setHomeScore(3)
  .setAwayScore(1);

const team3Vteam4 = a.match
  .withHomeTeam(team3)
  .withAwayTeam(team4)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .withPredictions(team3Vteam4User1, team3Vteam4User2)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(4)
  .setAwayScore(1);

const team2Vteam4User1 = a.prediction
  .withUser(user1)
  .setHomeScore(0)
  .setAwayScore(1);

const team2Vteam4User2 = a.prediction
  .withUser(user2)
  .setHomeScore(0)
  .setAwayScore(2);

const team2Vteam4 = a.match
  .withHomeTeam(team2)
  .withAwayTeam(team4)
  .setDate('2021-08-18T11:30:00Z')
  .withGameRound(gw2)
  .withPredictions(team2Vteam4User1, team2Vteam4User2)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(0)
  .setAwayScore(1);

const team1Vteam3User1 = a.prediction
  .withUser(user1)
  .setHomeScore(2)
  .setAwayScore(1);

const team1Vteam3User2 = a.prediction
  .withUser(user2)
  .setHomeScore(1)
  .setAwayScore(1);

const team1Vteam3 = a.match
  .withHomeTeam(team1)
  .withAwayTeam(team3)
  .setDate('2021-08-18T11:30:00Z')
  .withGameRound(gw2)
  .withPredictions(team1Vteam3User1, team1Vteam3User2)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(0)
  .setAwayScore(0);

describe('LeaderboardProcessor', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  beforeEach(async () => {
    await a.game
      .withUsers(user1, user2)
      .withTeams(team1, team2, team3, team4)
      .withCompetitions(epl)
      .withSeasons(
        epl2021
          .withTeams(team1, team2, team3, team4)
          .withGameRounds(gw1, gw2)
          .withMatches(team1Vteam2, team3Vteam4, team1Vteam3, team2Vteam4)
      )
      .build();
  });

  // +------------------+--------+-----------+--------+-----------+--------+
  // |                  | result | user-1    | u1 pts | user-2    | u2 pts |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | gameweek-1       |                    |        |           |        |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | team-1 vs team-2 | 3 - 1  | 2 - 0 (j) | 18     | 4 - 0 (j) | 16     |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | team-3 vs team-4 | 4 - 1  | 2 - 1     | 8      | 3 - 1     | 10     |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | pts              |                    | 26     |           | 26     |
  // +------------------+--------------------+--------+-----------+--------+
  // | gameweek-2       |                    |        |           |        |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | team-2 vs team-4 | 0 - 1  | 0 - 1     | 20     | 0 - 2     | 10     |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | team-1 vs team-3 | 0 - 0  | 2 - 1     | 0      | 1 - 1     | 10     |
  // +------------------+--------+-----------+--------+-----------+--------+
  // | pts              |                    | 20     |           | 20     |
  // +------------------+--------------------+--------+-----------+--------+
  it('should create seasonBoard if it doesnt exist', async () => {
    const matches = [
      team1Vteam2.match!,
      team3Vteam4.match!,
      team2Vteam4.match!,
      team1Vteam3.match!,
    ];
    await predictionProcessor.calculateAndUpdatePredictionPoints(
      epl2021.id,
      matches
    );
    await leaderboardProcessor.updateScores(epl2021.id, matches);

    const boards = await lastValueFrom(leaderboardRepo.findAll$());
    // console.log('boards', boards);
    const userScores = await lastValueFrom(userScoreRepo.findAll$());
    // console.log('userScores', userScores);
    await leaderboardProcessor.updateRankings(epl2021.id, matches);
    const ordUserScores = await lastValueFrom(userScoreRepo.findAll$());
    // console.log('ordUserScores', ordUserScores);
    console.log('Buyaah');
  });
});
