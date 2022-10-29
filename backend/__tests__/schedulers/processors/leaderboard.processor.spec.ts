import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import a from '../../a'
import memoryDb from '../../memoryDb'
import { LeaderboardProcessorImpl } from '../../../app/schedulers/leaderboard.processor'
import { PredictionProcessorImpl } from '../../../app/schedulers/prediction.processor'
import { LeaderboardRepositoryImpl } from '../../../db/repositories/leaderboard.repo';
import { lastValueFrom } from 'rxjs';
import { MatchStatus } from '../../../db/models/match.model';
import { UserScoreRepositoryImpl } from '../../../db/repositories/userScore.repo';

const leaderboardProcessor = LeaderboardProcessorImpl.getInstance()
const leaderboardRepo = LeaderboardRepositoryImpl.getInstance()
const userScoreRepo = UserScoreRepositoryImpl.getInstance()
const predictionProcessor = PredictionProcessorImpl.getInstance()

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
  })

const team1 = a.team.setName('Team 1').setSlug('team-1');
const team2 = a.team.setName('Team 2').setSlug('team-2');
const team3 = a.team.setName('Team 3').setSlug('team-3');
const team4 = a.team.setName('Team 4').setSlug('team-4');

const gw1 = a.gameRound.setName('Gameweek 1').setSlug('gameweek-1').setPosition(1);
const gw2 = a.gameRound.setName('Gameweek 2').setSlug('gameweek-2').setPosition(2);

const user1 = a.user.setUsername('charles');
const user2 = a.user.setUsername('kagiri');

const user1team1Vteam2Pred = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(0)
  .setJoker(true)

const user2team1Vteam2Pred = a.prediction
  .withUser(user2)
  .setHomeScore(2)
  .setAwayScore(1)
  .setJoker(true)

const team1Vteam2 = a.match
  .withHomeTeam(team1)
  .withAwayTeam(team2)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .withPredictions(user1team1Vteam2Pred, user2team1Vteam2Pred)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(3)
  .setAwayScore(0)

const user1team3Vteam4 = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(0)

const user2team3Vteam4 = a.prediction
  .withUser(user2)
  .setHomeScore(3)
  .setAwayScore(1)

const team3Vteam4 = a.match
  .withHomeTeam(team3)
  .withAwayTeam(team4)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .withPredictions(user1team3Vteam4, user2team3Vteam4)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(4)
  .setAwayScore(1)

const user1team2Vteam4 = a.prediction
  .withUser(user1)
  .setHomeScore(0)
  .setAwayScore(2)

const user2team2Vteam4 = a.prediction
  .withUser(user2)
  .setHomeScore(1)
  .setAwayScore(2)

const team2Vteam4 = a.match
  .withHomeTeam(team2)
  .withAwayTeam(team4)
  .setDate('2021-08-18T11:30:00Z')
  .withGameRound(gw2)
  .withPredictions(user1team2Vteam4, user2team2Vteam4)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(0)
  .setAwayScore(1)

const user1team1Vteam3 = a.prediction
  .withUser(user1)
  .setHomeScore(0)
  .setAwayScore(2)

const user2team1Vteam3 = a.prediction
  .withUser(user2)
  .setHomeScore(0)
  .setAwayScore(1)

const team1Vteam3 = a.match
  .withHomeTeam(team1)
  .withAwayTeam(team3)
  .setDate('2021-08-18T11:30:00Z')
  .withGameRound(gw2)
  .withPredictions(user1team1Vteam3, user2team1Vteam3)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(0)
  .setAwayScore(0)

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
  })

  it('should create seasonBoard if it doesnt exist', async () => {
    const matches = [team1Vteam2.match!, team3Vteam4.match!, team2Vteam4.match!, team1Vteam3.match!]
    await predictionProcessor.calculateAndUpdatePredictionPoints(epl2021.id, matches)
    const result = await leaderboardProcessor.updateScores(epl2021.id, matches)

    const boards = await lastValueFrom(leaderboardRepo.findAll$());
    const userScores = await lastValueFrom(userScoreRepo.findAll$())
    console.log('Buyaah')
  })
})
